package br.edu.fatecpg.vivapg.service;

import br.edu.fatecpg.vivapg.model.Bairro;
import br.edu.fatecpg.vivapg.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

/**
 * Integração com APIs públicas reais — executa ao iniciar o backend.
 *
 * Ordem de execução:
 *   1. IBGE      → dados do município (contexto)
 *   2. CNES      → total de estabelecimentos de saúde
 *   3. Nominatim → coordenadas lat/lon por bairro  ← dado real por bairro
 */
@Slf4j
@Service
@Order(2)
@RequiredArgsConstructor
public class ApiIntegrationService implements CommandLineRunner {

    private final BairroRepository bairroRepository;
    private final WebClient.Builder webClientBuilder;

    private static final String COD_IBGE_MUNICIPIO = "3541000";
    private static final String COD_CNES_MUNICIPIO = "354100";

    @Override
    public void run(String... args) throws Exception {
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info(" Iniciando integração com APIs públicas...");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        buscarCoordenadasNominatim();       // 1º: salva lat/lon

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("✅ Integração com APIs concluída!");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    @SuppressWarnings({"unchecked","rawtypes"})
    private void buscarCoordenadasNominatim() {
        WebClient client = webClientBuilder
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "VivaPG/1.0 FATEC-PraiaGrande")
                .defaultHeader("Accept-Language", "pt-BR")
                .build();

        List<Bairro> semCoordenadas = bairroRepository.findAll().stream()
                .filter(b -> b.getLatitude() == 0 && b.getLongitude() == 0)
                .toList();

        log.info("📍 Nominatim → buscando coordenadas de {} bairros...", semCoordenadas.size());
        int atualizados = 0;

        for (Bairro bairro : semCoordenadas) {
            try {
                String nomeBusca = bairro.getNome();
                if (nomeBusca.equalsIgnoreCase("Balneário Flórida")) {
                    nomeBusca = "Balneario Florida";
                } else if (nomeBusca.equalsIgnoreCase("Jardim Real")) {
                    nomeBusca = "Praia do Jardim Real";
                } else if (nomeBusca.equalsIgnoreCase("Balneário Maracanã")) {
                    nomeBusca = "Maracanã";
                }

                String query = nomeBusca + ", Praia Grande, São Paulo, Brasil";

                List resultados = client.get()
                        .uri(u -> u.path("/search")
                                .queryParam("q", query)
                                .queryParam("format", "json")
                                .queryParam("limit", "1")
                                .queryParam("countrycodes", "br").build())
                        .retrieve().bodyToFlux(Map.class).collectList()
                        .timeout(java.time.Duration.ofSeconds(6))
                        .onErrorReturn(List.of()).block();

                if (resultados != null && !resultados.isEmpty()) {
                    Map r = (Map) resultados.get(0);
                    bairro.setLatitude(Double.parseDouble(r.get("lat").toString()));
                    bairro.setLongitude(Double.parseDouble(r.get("lon").toString()));
                    bairroRepository.save(bairro);
                    atualizados++;
                    log.info("📍 {} → {}, {}", bairro.getNome(),
                            String.format("%.4f", bairro.getLatitude()),
                            String.format("%.4f", bairro.getLongitude()));
                } else {
                    if (bairro.getNome().equalsIgnoreCase("Balneário Flórida")) {
                        bairro.setLatitude(-24.0622); bairro.setLongitude(-46.5681);
                        bairroRepository.save(bairro); atualizados++;
                    } else if (bairro.getNome().equalsIgnoreCase("Jardim Real")) {
                        bairro.setLatitude(-24.0531); bairro.setLongitude(-46.5450);
                        bairroRepository.save(bairro); atualizados++;
                    }
                }
                Thread.sleep(1300); // rate limit seguro
            } catch (Exception e) {
                log.warn("⚠️ Nominatim falhou para {}: {}", bairro.getNome(), e.getMessage());
            }
        }
        log.info("✅ Nominatim → {}/{} coordenadas salvas", atualizados, semCoordenadas.size());
    }
}
