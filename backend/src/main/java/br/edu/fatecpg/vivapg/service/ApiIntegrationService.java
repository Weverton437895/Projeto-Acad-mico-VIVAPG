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
 *   4. Overpass  → amenidades reais por bairro     ← dado real por bairro
 */
@Slf4j
@Service
@Order(2)
@RequiredArgsConstructor
public class ApiIntegrationService implements CommandLineRunner {

    private final BairroRepository bairroRepository;
    private final WebClient.Builder webClientBuilder;
    private final OverpassService   overpassService;

    private static final String COD_IBGE_MUNICIPIO = "3541406";
    private static final String COD_CNES_MUNICIPIO = "354140";

    @Override
    public void run(String... args) throws Exception {
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("🌐 Iniciando integração com APIs públicas...");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        buscarDadosIBGE();
        buscarDadosCNES();
        buscarCoordenadasNominatim();       // 1º: salva lat/lon
        overpassService.atualizarIndicesReais(); // 2º: usa lat/lon para buscar amenidades

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("✅ Integração com APIs concluída!");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    @SuppressWarnings({"unchecked","rawtypes"})
    private void buscarDadosIBGE() {
        try {
            WebClient client = webClientBuilder
                    .baseUrl("https://servicodados.ibge.gov.br").build();

            Map municipio = client.get()
                    .uri("/api/v1/localidades/municipios/" + COD_IBGE_MUNICIPIO)
                    .retrieve().bodyToMono(Map.class)
                    .timeout(java.time.Duration.ofSeconds(8))
                    .onErrorReturn(new HashMap<>()).block();

            if (municipio != null && !municipio.isEmpty())
                log.info("📊 IBGE → Município: {} | Código: {}", municipio.get("nome"), COD_IBGE_MUNICIPIO);

        } catch (Exception e) {
            log.warn("⚠️ IBGE indisponível: {}", e.getMessage());
        }
    }

    @SuppressWarnings({"unchecked","rawtypes"})
    private void buscarDadosCNES() {
        try {
            WebClient client = webClientBuilder
                    .baseUrl("https://apidadosabertos.saude.gov.br").build();

            Map response = client.get()
                    .uri(u -> u.path("/v1/cnes/estabelecimentos")
                            .queryParam("codigo_ibge", COD_CNES_MUNICIPIO)
                            .queryParam("limit", "1").build())
                    .retrieve().bodyToMono(Map.class)
                    .timeout(java.time.Duration.ofSeconds(10))
                    .onErrorReturn(new HashMap<>()).block();

            if (response != null && response.containsKey("total"))
                log.info("🏥 CNES → {} estabelecimentos de saúde em Praia Grande",
                        ((Number) response.get("total")).intValue());

        } catch (Exception e) {
            log.warn("⚠️ CNES indisponível: {}", e.getMessage());
        }
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
                String query = bairro.getNome() + ", Praia Grande, São Paulo, Brasil";

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
                }
                Thread.sleep(1200); // rate limit Nominatim
            } catch (Exception e) {
                log.warn("⚠️ Nominatim falhou para {}: {}", bairro.getNome(), e.getMessage());
            }
        }
        log.info("✅ Nominatim → {}/{} coordenadas salvas", atualizados, semCoordenadas.size());
    }
}