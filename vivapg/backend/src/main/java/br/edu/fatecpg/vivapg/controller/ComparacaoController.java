package br.edu.fatecpg.vivapg.controller;

import br.edu.fatecpg.vivapg.model.*;
import br.edu.fatecpg.vivapg.repository.*;
import br.edu.fatecpg.vivapg.service.RecomendacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/comparacoes")
@RequiredArgsConstructor
public class ComparacaoController {

    private final ComparacaoRepository comparacaoRepository;
    private final BairroRepository     bairroRepository;
    private final RecomendacaoService  recomendacaoService;

    // ── Lista comparações salvas do usuário ───────────────────
    @GetMapping
    public ResponseEntity<?> listar(Authentication auth) {
        String usuarioId = (String) auth.getPrincipal();
        List<Comparacao> comps = comparacaoRepository.findByUsuarioIdOrderBySalvoEmDesc(usuarioId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Comparacao c : comps) {
            List<Bairro> bairros = c.getBairrosIds().stream()
                    .map(id -> bairroRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull).toList();
            result.add(Map.of("comparacao", c, "bairros", bairros));
        }
        return ResponseEntity.ok(result);
    }

    // ── Salva comparação ──────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Map<String, Object> body, Authentication auth) {
        String usuarioId = (String) auth.getPrincipal();
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) body.get("bairrosIds");
        if (ids == null || ids.size() != 2)
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe exatamente 2 bairros"));
        Comparacao c = new Comparacao();
        c.setUsuarioId(usuarioId);
        c.setBairrosIds(ids);
        return ResponseEntity.ok(comparacaoRepository.save(c));
    }

    // ── Exclui comparação ─────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable String id) {
        comparacaoRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensagem", "Comparação excluída"));
    }

    /**
     * Endpoint dedicado para análise de comparação.
     * Calcula o score dos dois bairros usando o mesmo algoritmo de recomendação
     * SEM filtros de orçamento — comparação sempre imparcial.
     *
     * Body: { bairro1Id, bairro2Id, perfil: { ocupacao, faixaRenda, prioridades, ... } }
     */
    @PostMapping("/analisar")
    public ResponseEntity<?> analisar(@RequestBody Map<String, Object> body) {
        String bairro1Id = (String) body.get("bairro1Id");
        String bairro2Id = (String) body.get("bairro2Id");

        @SuppressWarnings("unchecked")
        Map<String, Object> perfilMap = (Map<String, Object>) body.get("perfil");

        if (bairro1Id == null || bairro2Id == null)
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe os dois bairros"));

        // Monta perfil a partir do body
        Perfil perfil = new Perfil();
        if (perfilMap != null) {
            perfil.setOcupacao((String) perfilMap.getOrDefault("ocupacao", ""));
            perfil.setFaixaRenda((String) perfilMap.getOrDefault("faixaRenda", ""));
            perfil.setTipoBairro((String) perfilMap.getOrDefault("tipoBairro", ""));
            Object renda = perfilMap.get("rendaMensal");
            if (renda instanceof Number) perfil.setRendaMensal(((Number) renda).doubleValue());
            Object quartos = perfilMap.get("numQuartos");
            if (quartos instanceof Number) perfil.setNumQuartos(((Number) quartos).intValue());
            @SuppressWarnings("unchecked")
            List<String> prios = (List<String>) perfilMap.getOrDefault("prioridades", List.of());
            perfil.setPrioridades(prios);
        }

        // Calcula scores sem filtro de orçamento
        Map<String, Object> resultado1 = recomendacaoService.calcularParaComparacao(bairro1Id, perfil);
        Map<String, Object> resultado2 = recomendacaoService.calcularParaComparacao(bairro2Id, perfil);

        if (resultado1 == null || resultado2 == null)
            return ResponseEntity.badRequest().body(Map.of("erro", "Bairro não encontrado"));

        double score1 = (double) resultado1.get("score");
        double score2 = (double) resultado2.get("score");
        double diff   = Math.abs(score1 - score2);

        // Determina vencedor (empate técnico se diferença < 2 pontos)
        String vencedor;
        String motivo;
        if (diff < 2.0) {
            vencedor = "empate";
            motivo   = "Os dois bairros são muito similares para o seu perfil — ambos são boas opções.";
        } else if (score1 > score2) {
            @SuppressWarnings("unchecked")
            List<String> dest = (List<String>) resultado1.getOrDefault("destaques", List.of());
            vencedor = bairro1Id;
            motivo   = gerarMotivo((Bairro) resultado1.get("bairro"), dest, score1 - score2);
        } else {
            @SuppressWarnings("unchecked")
            List<String> dest = (List<String>) resultado2.getOrDefault("destaques", List.of());
            vencedor = bairro2Id;
            motivo   = gerarMotivo((Bairro) resultado2.get("bairro"), dest, score2 - score1);
        }

        return ResponseEntity.ok(Map.of(
                "resultado1", resultado1,
                "resultado2", resultado2,
                "vencedorId", vencedor,
                "diferencaPontos", Math.round(diff * 10.0) / 10.0,
                "motivo", motivo
        ));
    }

    private String gerarMotivo(Bairro b, List<String> destaques, double diff) {
        StringBuilder sb = new StringBuilder(b.getNome());
        sb.append(" se destaca com ").append(String.format("%.1f", diff)).append(" pontos a mais");
        if (!destaques.isEmpty()) {
            sb.append(", especialmente em: ").append(String.join(", ", destaques));
        }
        sb.append(".");
        return sb.toString();
    }
}