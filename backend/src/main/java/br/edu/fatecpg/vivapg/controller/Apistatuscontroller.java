package br.edu.fatecpg.vivapg.controller;

import br.edu.fatecpg.vivapg.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

/**
 * Endpoint público para verificar status das APIs externas integradas.
 * GET /api/status/apis
 */
@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
class ApiStatusController {

    private final BairroRepository bairroRepository;
    private final WebClient.Builder webClientBuilder;

    @GetMapping("/apis")
    public ResponseEntity<?> statusApis() {
        Map<String, Object> status = new LinkedHashMap<>();

        // 1. IBGE
        status.put("ibge", testarAPI(
                "https://servicodados.ibge.gov.br",
                "/api/v1/localidades/municipios/3543303",
                "IBGE — Dados do município de Praia Grande"
        ));

        // 2. CNES
        status.put("cnes", testarAPI(
                "https://apidadosabertos.saude.gov.br",
                "/v1/cnes/estabelecimentos?codigo_ibge=354780&limit=1",
                "CNES — Estabelecimentos de saúde"
        ));

        // 3. Nominatim
        status.put("nominatim", testarAPI(
                "https://nominatim.openstreetmap.org",
                "/search?q=Boqueirão,Praia+Grande,SP&format=json&limit=1",
                "Nominatim — Coordenadas geográficas"
        ));

        // 4. ViaCEP
        status.put("viacep", testarAPI(
                "https://viacep.com.br",
                "/ws/11701000/json",
                "ViaCEP — Validação de endereços de Praia Grande"
        ));

        // 5. Status do banco
        long totalBairros = bairroRepository.count();
        long comCoordenadas = bairroRepository.findAll().stream()
                .filter(b -> b.getLatitude() != 0).count();

        status.put("banco", Map.of(
                "status",         "online",
                "descricao",      "MongoDB — banco de dados",
                "totalBairros",   totalBairros,
                "comCoordenadas", comCoordenadas + "/" + totalBairros
        ));

        return ResponseEntity.ok(status);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> testarAPI(String baseUrl, String path, String descricao) {
        try {
            WebClient client = webClientBuilder.baseUrl(baseUrl)
                    .defaultHeader("User-Agent", "VivaPG/1.0 FATEC-PraiaGrande")
                    .build();

            Object response = client.get().uri(path)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .timeout(java.time.Duration.ofSeconds(5))
                    .block();

            return Map.of(
                    "status",    "online",
                    "descricao", descricao,
                    "url",       baseUrl + path
            );
        } catch (Exception e) {
            return Map.of(
                    "status",    "offline",
                    "descricao", descricao,
                    "url",       baseUrl + path,
                    "erro",      e.getMessage()
            );
        }
    }
}