package br.edu.fatecpg.vivapg.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "historico")
public class Historico {
    @Id
    private String id;
    private String usuarioId;
    private Map<String, Object> filtros;
    private List<String> resultado; // ids dos bairros retornados
    private LocalDateTime realizadoEm = LocalDateTime.now();
}
