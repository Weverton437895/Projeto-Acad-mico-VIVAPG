package br.edu.fatecpg.vivapg.config;

import br.edu.fatecpg.vivapg.model.Bairro;
import br.edu.fatecpg.vivapg.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.List;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final BairroRepository bairroRepository;

    @Override
    public void run(String... args) {
        // Não apaga — preserva coordenadas salvas pelo Nominatim
        if (bairroRepository.count() > 0) {
            log.info("✅ Banco já populado — pulando DataSeeder");
            return;
        }

        List<Bairro> bairros = List.of(
                // nome, regiao, classif, praia, seg, edu, sau, tra, laz, tranq, alg1, alg2, alg3, custo

                // ── 🏢 ORLA NOBRE (Alto Padrão e Comercial) ──────────────────────────────────
                b("Canto do Forte",     "Orla Nobre",       "praiano",    true,  95,85,85,80,95,75, 2500,3800,5000,3500),
                b("Boqueirão",          "Orla Nobre",       "urbano",     true,  88,90,88,85,90,55, 2000,3000,4200,2800),
                b("Guilhermina",        "Orla Nobre",       "urbano",     true,  86,84,82,80,88,65, 1800,2800,3800,2400),

                // ── 🛍️ ORLA CENTRAL (Alta Densidade) ─────────────────────────────────────────
                b("Aviação",            "Orla Central",     "praiano",    true,  84,80,80,78,82,70, 1800,2600,3600,2200),
                b("Tupi",               "Orla Central",     "praiano",    true,  82,80,78,78,80,68, 1700,2500,3400,2100),
                b("Ocian",              "Orla Central",     "urbano",     true,  80,78,78,82,85,60, 1600,2400,3200,2000),
                b("Mirim",              "Orla Central",     "praiano",    true,  78,76,80,80,75,72, 1500,2200,3000,1800),

                // ── 🌊 ORLA SUL (Foco em Calmaria e Veraneio) ────────────────────────────────────
                b("Maracanã",           "Orla Sul",         "praiano",    true,  76,70,72,70,72,85, 1400,2100,2800,1600),
                b("Caiçara",            "Orla Sul",         "praiano",    true,  80,75,75,72,82,75, 1600,2300,3100,1900),
                b("Real",               "Orla Sul",         "praiano",    true,  75,68,70,68,68,88, 1300,1900,2600,1500),
                b("Flórida",            "Orla Sul",         "praiano",    true,  88,72,72,65,70,95, 2200,3200,4500,2800),
                b("Solemar",            "Orla Sul",         "praiano",    true,  74,65,68,62,65,92, 1200,1800,2400,1400),

                // ── 🏙️ LADO SERRA NORTE (Continental Superior) ──────────────────────────────────
                b("Sítio do Campo",     "Lado Serra Norte", "urbano",     false, 82,80,78,85,80,70, 1500,2200,3000,1800),
                b("Glória",             "Lado Serra Norte", "residencial",false, 72,70,70,75,62,75, 1100,1600,2200,1300),
                b("Vila Sônia",         "Lado Serra Norte", "residencial",false, 68,68,68,74,60,72, 1000,1500,2000,1200),
                b("Tupiry",             "Lado Serra Norte", "residencial",false, 68,66,65,70,55,80, 1000,1450,1950,1150),
                b("Quietude",           "Lado Serra Norte", "urbano",     false, 74,72,75,78,68,65, 1200,1700,2300,1400),
                b("Antártica",          "Lado Serra Norte", "residencial",false, 66,65,65,70,58,78,  950,1400,1900,1100),

                // ── 🏡 LADO SERRA SUL (Zonas Residenciais Habitáveis) ───────────────────────────
                b("Esmeralda",          "Lado Serra Sul",   "residencial",false, 63,60,62,65,50,76,  850,1250,1700, 950),
                b("Samambaia",          "Lado Serra Sul",   "residencial",false, 68,66,66,70,56,82, 1000,1400,1900,1100),
                b("Ribeirópolis",       "Lado Serra Sul",   "residencial",false, 62,60,60,62,48,82,  850,1200,1650, 900),
                b("Princesa",           "Lado Serra Sul",   "tranquilo",  false, 66,62,62,60,50,86,  900,1300,1750,1000),
                b("Imperador",          "Lado Serra Sul",   "tranquilo",  false, 72,66,68,65,55,88, 1100,1500,2000,1200),
                b("Cidade da Criança",  "Lado Serra Sul",   "tranquilo",  false, 65,62,60,60,50,85,  850,1200,1650, 950),
                b("Melvi",              "Lado Serra Sul",   "residencial",false, 64,62,64,68,54,75,  900,1300,1800,1000),
                b("Nova Mirim",         "Lado Serra Sul",   "residencial",false, 70,70,72,75,60,70, 1100,1600,2100,1300),
                b("Anhanguera",         "Lado Serra Sul",   "residencial",false, 65,64,62,68,52,78,  900,1300,1800,1050),
                b("Santa Marina",       "Lado Serra Sul",   "residencial",false, 68,65,66,70,54,80, 1000,1400,1900,1100)
        );


        bairroRepository.saveAll(bairros);
        log.info("✅ {} bairros de Praia Grande cadastrados!", bairros.size());
    }

    private Bairro b(String nome, String regiao, String classif, boolean praia,
                     double seg, double edu, double sau, double tra, double laz, double tranq,
                     double alg1, double alg2, double alg3, double custo) {
        Bairro b = new Bairro();
        b.setNome(nome);             b.setRegiao(regiao);
        b.setClassificacao(classif); b.setTemPraia(praia);
        b.setIndSeguranca(seg);      b.setIndEducacao(edu);
        b.setIndSaude(sau);          b.setIndTransporte(tra);
        b.setIndLazer(laz);          b.setIndTranquilidade(tranq);
        b.setAluguel1Quarto(alg1);   b.setAluguel2Quartos(alg2);
        b.setAluguel3Quartos(alg3);  b.setCustoVidaMedia(custo);
        return b;
    }
}