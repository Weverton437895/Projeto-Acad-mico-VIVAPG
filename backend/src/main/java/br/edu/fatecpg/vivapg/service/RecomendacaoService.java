package br.edu.fatecpg.vivapg.service;

import br.edu.fatecpg.vivapg.model.Bairro;
import br.edu.fatecpg.vivapg.model.Perfil;
import br.edu.fatecpg.vivapg.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecomendacaoService {

    private final BairroRepository bairroRepository;

    private static final double PESO_BASE       = 5.0;
    private static final double PESO_PRIORIDADE = 60.0;
    private static final double PESO_OCUPACAO   = 8.0;

    private static final Map<String, Map<String, Double>> PERFIS = Map.of(
            "estudante",          Map.of("educacao", 1.0, "transporte", 1.0),
            "clt",                Map.of("transporte", 1.0, "seguranca", 1.0),
            "autonomo",           Map.of("transporte", 1.0, "lazer", 0.5),
            "aposentado",         Map.of("saude", 1.0, "seguranca", 1.0, "tranquilidade", 1.0),
            "trabalhador_remoto", Map.of("tranquilidade", 1.0, "lazer", 0.5),
            "familia",            Map.of("seguranca", 1.0, "educacao", 1.0, "saude", 1.0)
    );

    // ── Recomendação com filtros ───────────────────────────────
    public List<Map<String, Object>> recomendar(Perfil perfil) {
        return bairroRepository.findAll().stream()
                .filter(b -> filtrarPorTipo(b, perfil))
                .filter(b -> filtrarPorOrcamento(b, perfil))
                .map(b -> calcularResultado(b, perfil))
                .sorted((a, b) -> Double.compare((Double) b.get("score"), (Double) a.get("score")))
                .collect(Collectors.toList());
    }

    // ── Comparação: calcula score SEM filtros ─────────────────
    public Map<String, Object> calcularParaComparacao(String bairroId, Perfil perfil) {
        return bairroRepository.findById(bairroId)
                .map(b -> calcularResultado(b, perfil))
                .orElse(null);
    }

    private boolean filtrarPorTipo(Bairro b, Perfil p) {
        String tipo = p.getTipoBairro();
        if (tipo == null || tipo.isBlank()) return true;
        return switch (tipo) {
            case "praiano"     ->  b.isTemPraia();
            case "residencial" -> !b.isTemPraia();
            case "tranquilo"   ->  "tranquilo".equals(b.getClassificacao());
            case "urbano"      ->  "urbano".equals(b.getClassificacao());
            default            -> true;
        };
    }

    private boolean filtrarPorOrcamento(Bairro b, Perfil p) {
        if (p.getRendaMensal() <= 0) return true;
        int q = p.getNumQuartos() > 0 ? p.getNumQuartos() : 1;
        return aluguel(b, q) <= p.getRendaMensal() * 0.70;
    }

    private double aluguel(Bairro b, int q) {
        return switch (q) {
            case 1  -> b.getAluguel1Quarto();
            case 2  -> b.getAluguel2Quartos();
            default -> b.getAluguel3Quartos();
        };
    }

    // ── Score central — reutilizado por recomendação e comparação
    public Map<String, Object> calcularResultado(Bairro bairro, Perfil perfil) {
        String       ocupacao = perfil.getOcupacao() != null ? perfil.getOcupacao().toLowerCase() : "";
        double       renda    = perfil.getRendaMensal();
        List<String> prios    = perfil.getPrioridades() != null ? perfil.getPrioridades() : List.of();

        Map<String, Double> pesos = new LinkedHashMap<>();
        pesos.put("seguranca",     PESO_BASE);
        pesos.put("educacao",      PESO_BASE);
        pesos.put("saude",         PESO_BASE);
        pesos.put("transporte",    PESO_BASE);
        pesos.put("lazer",         PESO_BASE);
        pesos.put("tranquilidade", PESO_BASE);

        for (String p : prios) {
            if (pesos.containsKey(p)) pesos.put(p, PESO_PRIORIDADE);
        }

        Map<String, Double> bonus = PERFIS.getOrDefault(ocupacao, Map.of());
        bonus.forEach((k, fator) -> pesos.merge(k, PESO_OCUPACAO * fator, Double::sum));

        double totalPesos = pesos.values().stream().mapToDouble(Double::doubleValue).sum();
        double pontuacao  =
                (bairro.getIndSeguranca()     * pesos.get("seguranca")     +
                        bairro.getIndEducacao()      * pesos.get("educacao")      +
                        bairro.getIndSaude()         * pesos.get("saude")         +
                        bairro.getIndTransporte()    * pesos.get("transporte")    +
                        bairro.getIndLazer()         * pesos.get("lazer")         +
                        bairro.getIndTranquilidade() * pesos.get("tranquilidade")) / totalPesos;

        int    q             = perfil.getNumQuartos() > 0 ? perfil.getNumQuartos() : 1;
        double aluguelBairro = aluguel(bairro, q);

        String nivelFinanceiro = "ok";
        if (renda > 0) {
            double pct = aluguelBairro / renda;
            if      (pct <= 0.25) nivelFinanceiro = "confortavel";
            else if (pct <= 0.40) nivelFinanceiro = "aceitavel";
            else if (pct <= 0.70) nivelFinanceiro = "apertado";
            else                  nivelFinanceiro = "fora";
        }

        String label, labelCor;
        if      (pontuacao >= 82) { label = "⭐ Ideal para você"; labelCor = "ideal"; }
        else if (pontuacao >= 72) { label = "✓ Ótima opção";      labelCor = "otimo"; }
        else if (pontuacao >= 62) { label = "👍 Boa opção";        labelCor = "bom"; }
        else                      { label = "~ Opção razoável";    labelCor = "razoavel"; }

        Map<String, String> nomeAmigavel = Map.of(
                "seguranca","Segurança","educacao","Educação","saude","Saúde",
                "transporte","Transporte","lazer","Lazer","tranquilidade","Tranquilidade"
        );
        List<String> prioLabels = new ArrayList<>(
                prios.stream().filter(nomeAmigavel::containsKey)
                        .map(nomeAmigavel::get).collect(Collectors.toList())
        );
        bonus.keySet().forEach(k -> {
            String nome = nomeAmigavel.getOrDefault(k, k);
            if (!prioLabels.contains(nome)) prioLabels.add(nome + " ★");
        });

        // Destaques: quais índices mais contribuíram
        List<String> destaques = pesos.entrySet().stream()
                .filter(e -> e.getValue() >= PESO_PRIORIDADE)
                .map(e -> nomeAmigavel.getOrDefault(e.getKey(), e.getKey()))
                .collect(Collectors.toList());

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("bairro",            bairro);
        r.put("pontuacao",         Math.round(pontuacao * 10.0) / 10.0);
        r.put("score",             pontuacao);
        r.put("label",             label);
        r.put("labelCor",          labelCor);
        r.put("nivelFinanceiro",   nivelFinanceiro);
        r.put("aluguelIndicado",   aluguelBairro);
        r.put("prioridadesUsadas", prioLabels);
        r.put("destaques",         destaques);
        return r;
    }
}