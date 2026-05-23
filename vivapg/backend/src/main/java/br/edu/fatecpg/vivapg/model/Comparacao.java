package br.edu.fatecpg.vivapg.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "comparacoes")
public class Comparacao {
    @Id
    private String id;
    private String usuarioId;
    private List<String> bairrosIds; // [bairro1Id, bairro2Id]
    private LocalDateTime salvoEm = LocalDateTime.now();
}
