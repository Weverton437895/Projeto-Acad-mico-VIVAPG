package br.edu.fatecpg.vivapg.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "bairros")
public class Bairro {

    @Id
    private String id;

    private String nome;
    private String regiao;

    // Classificação do bairro: "praiano", "urbano", "residencial", "tranquilo"
    private String classificacao;

    private boolean temPraia;

    // Índices de qualidade (0 a 100)
    private double indSeguranca;
    private double indEducacao;
    private double indSaude;
    private double indTransporte;
    private double indLazer;
    private double indTranquilidade; // novo: mede silêncio, baixa densidade

    // Aluguel médio por número de quartos (valores reais 2026)
    private double aluguel1Quarto;
    private double aluguel2Quartos;
    private double aluguel3Quartos;
    private double custoVidaMedia;

    // Coordenadas geográficas (para futuro mapa)
    private double latitude;
    private double longitude;

    private LocalDateTime atualizadoEm = LocalDateTime.now();
}