package br.edu.fatecpg.vivapg.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "perfis")
public class Perfil {

    @Id
    private String id;

    private String usuarioId;

    private String faixaRenda;    // "ate2000", "2000a4000", "4000a7000", "acima7000"
    private String tipoBairro;    // "praiano", "residencial", "comercial"
    private String ocupacao;      // "estudante", "clt", "autonomo", "aposentado"
    private int    numQuartos;    // 1, 2, 3
    private double rendaMensal;

    private List<String> prioridades; // ["seguranca", "educacao", "saude", "transporte", "lazer", "custo_vida"]
}
