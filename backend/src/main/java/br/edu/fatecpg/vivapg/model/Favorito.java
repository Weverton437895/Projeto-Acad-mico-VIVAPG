package br.edu.fatecpg.vivapg.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "favoritos")
public class Favorito {
    @Id
    private String id;
    private String usuarioId;
    private String bairroId;
    private LocalDateTime salvoEm = LocalDateTime.now();
}
