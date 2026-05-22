package br.edu.fatecpg.vivapg.service;

import br.edu.fatecpg.vivapg.model.Bairro;
import br.edu.fatecpg.vivapg.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

/**
 * Serviço que consulta a API Overpass (OpenStreetMap) para obter
 * dados REAIS de amenidades por bairro em Praia Grande.
 *
 * Usa as coordenadas (lat/lon) já salvas pelo Nominatim para
 * buscar em raio de 1.5km ao redor de cada bairro:
 *   - Saúde:     hospitais, clínicas, UBSs, farmácias
 *   - Educação:  escolas, creches, faculdades
 *   - Transporte: pontos de ônibus, terminais
 *   - Lazer:     parques, praças, quadras, academias ao ar livre
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OverpassService {

    private final BairroRepository bairroRepository;
    private final WebClient.Builder webClientBuilder;

    private static final String OVERPASS_URL = "https://overpass-api.de";
    private static final int    RAIO_METROS  = 1500; // 1.5 km ao redor do bairro

    /**
     * Atualiza os índices de todos os bairros que já têm coordenadas salvas.
     * Chamado pelo ApiIntegrationService na inicialização do backend.
     */
    @SuppressWarnings("rawtypes")
    public void atualizarIndicesReais() {
        List<Bairro> bairros = bairroRepository.findAll().stream()
                .filter(b -> b.getLatitude() != 0 && b.getLongitude() != 0)
                .toList();

        if (bairros.isEmpty()) {
            log.warn("⚠️ Overpass: nenhum bairro com coordenadas. Execute o Nominatim primeiro.");
            return;
        }

        log.info("🗺️ Overpass → atualizando índices reais de {} bairros...", bairros.size());
        int atualizados = 0;

        WebClient client = webClientBuilder
                .baseUrl(OVERPASS_URL)
                .defaultHeader("User-Agent", "VivaPG/1.0 FATEC-PraiaGrande")
                .build();

        for (Bairro bairro : bairros) {
            try {
                double lat = bairro.getLatitude();
                double lon = bairro.getLongitude();

                // Busca contagens reais das 4 categorias
                int totalSaude      = contarAmenidades(client, lat, lon, buildQuerySaude(lat, lon));
                int totalEducacao   = contarAmenidades(client, lat, lon, buildQueryEducacao(lat, lon));
                int totalTransporte = contarAmenidades(client, lat, lon, buildQueryTransporte(lat, lon));
                int totalLazer      = contarAmenidades(client, lat, lon, buildQueryLazer(lat, lon));

                log.info("📍 {} → saúde:{} educação:{} transporte:{} lazer:{}",
                        bairro.getNome(), totalSaude, totalEducacao, totalTransporte, totalLazer);

                // Converte contagem real para índice 0-100
                bairro.setIndSaude(     normalizarIndice(totalSaude,      20, 60));
                bairro.setIndEducacao(  normalizarIndice(totalEducacao,   10, 50));
                bairro.setIndTransporte(normalizarIndice(totalTransporte, 30, 100));
                bairro.setIndLazer(     normalizarIndice(totalLazer,      10, 40));

                bairroRepository.save(bairro);
                atualizados++;

                // Rate limit: 1 req/segundo por categoria = 4 reqs por bairro
                // Aguarda 5 segundos entre bairros para não sobrecarregar a API
                Thread.sleep(5000);

            } catch (Exception e) {
                log.warn("⚠️ Overpass falhou para {}: {}", bairro.getNome(), e.getMessage());
            }
        }

        log.info("✅ Overpass → {}/{} bairros com índices reais atualizados",
                atualizados, bairros.size());
    }

    /**
     * Executa a query Overpass e retorna a contagem de elementos encontrados.
     */
    @SuppressWarnings({"rawtypes","unchecked"})
    private int contarAmenidades(WebClient client, double lat, double lon, String query) {
        try {
            Map response = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/interpreter")
                            .queryParam("data", query)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(java.time.Duration.ofSeconds(15))
                    .onErrorReturn(new HashMap<>())
                    .block();

            if (response == null || !response.containsKey("elements")) return 0;

            List elements = (List) response.get("elements");
            // Overpass com out count retorna 1 elemento com tag "total"
            if (!elements.isEmpty()) {
                Map el = (Map) elements.get(0);
                Map tags = (Map) el.getOrDefault("tags", new HashMap<>());
                Object total = tags.get("total");
                if (total != null) return Integer.parseInt(total.toString());
            }
            return elements.size();

        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Normaliza uma contagem real para a escala 0-100.
     * min = quantidade que representa índice ~40 (mínimo aceitável)
     * max = quantidade que representa índice ~100 (excelente)
     */
    private double normalizarIndice(int contagem, int min, int max) {
        if (contagem <= 0) return 30.0; // sem dado → índice baixo
        double normalizado = 40.0 + ((double)(contagem - min) / (max - min)) * 60.0;
        return Math.min(100.0, Math.max(30.0, Math.round(normalizado * 10.0) / 10.0));
    }

    // ── Queries Overpass ──────────────────────────────────────

    /**
     * Saúde: hospitais, clínicas, UBSs, farmácias, postos de saúde
     */
    private String buildQuerySaude(double lat, double lon) {
        return String.format(
                "[out:json];" +
                        "(node[\"amenity\"~\"hospital|clinic|doctors|pharmacy|health_post\"](around:%d,%.6f,%.6f);" +
                        "way[\"amenity\"~\"hospital|clinic|doctors|pharmacy|health_post\"](around:%d,%.6f,%.6f););" +
                        "out count;",
                RAIO_METROS, lat, lon, RAIO_METROS, lat, lon
        );
    }

    /**
     * Educação: escolas, creches, faculdades, bibliotecas
     */
    private String buildQueryEducacao(double lat, double lon) {
        return String.format(
                "[out:json];" +
                        "(node[\"amenity\"~\"school|kindergarten|university|college|library\"](around:%d,%.6f,%.6f);" +
                        "way[\"amenity\"~\"school|kindergarten|university|college|library\"](around:%d,%.6f,%.6f););" +
                        "out count;",
                RAIO_METROS, lat, lon, RAIO_METROS, lat, lon
        );
    }

    /**
     * Transporte: pontos de ônibus, terminais, paradas
     */
    private String buildQueryTransporte(double lat, double lon) {
        return String.format(
                "[out:json];" +
                        "(node[\"highway\"=\"bus_stop\"](around:%d,%.6f,%.6f);" +
                        "node[\"public_transport\"=\"stop_position\"](around:%d,%.6f,%.6f);" +
                        "node[\"amenity\"=\"bus_station\"](around:%d,%.6f,%.6f););" +
                        "out count;",
                RAIO_METROS, lat, lon, RAIO_METROS, lat, lon, RAIO_METROS, lat, lon
        );
    }

    /**
     * Lazer: parques, praças, quadras, academias ao ar livre, praias
     */
    private String buildQueryLazer(double lat, double lon) {
        return String.format(
                "[out:json];" +
                        "(node[\"leisure\"~\"park|playground|pitch|fitness_station|sports_centre\"](around:%d,%.6f,%.6f);" +
                        "way[\"leisure\"~\"park|playground|pitch|fitness_station|sports_centre\"](around:%d,%.6f,%.6f);" +
                        "node[\"natural\"=\"beach\"](around:%d,%.6f,%.6f);" +
                        "way[\"natural\"=\"beach\"](around:%d,%.6f,%.6f););" +
                        "out count;",
                RAIO_METROS, lat, lon, RAIO_METROS, lat, lon,
                RAIO_METROS, lat, lon, RAIO_METROS, lat, lon
        );
    }
}