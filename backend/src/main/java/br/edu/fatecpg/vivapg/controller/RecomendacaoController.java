package br.edu.fatecpg.vivapg.controller;

import br.edu.fatecpg.vivapg.model.*;
import br.edu.fatecpg.vivapg.repository.*;
import br.edu.fatecpg.vivapg.service.RecomendacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/recomendacao")
@RequiredArgsConstructor
public class RecomendacaoController {

    private final RecomendacaoService recomendacaoService;
    private final HistoricoRepository historicoRepository;

    // Busca sem login — recebe perfil no body
    @PostMapping
    public ResponseEntity<?> recomendar(@RequestBody Perfil perfil, Authentication auth) {
        List<Map<String, Object>> resultado = recomendacaoService.recomendar(perfil);

        // Salva no histórico se logado
        if (auth != null) {
            String usuarioId = (String) auth.getPrincipal();
            Historico h = new Historico();
            h.setUsuarioId(usuarioId);
            h.setFiltros(Map.of(
                "tipoBairro",  perfil.getTipoBairro() != null ? perfil.getTipoBairro() : "",
                "faixaRenda",  perfil.getFaixaRenda() != null ? perfil.getFaixaRenda() : "",
                "prioridades", perfil.getPrioridades() != null ? perfil.getPrioridades() : List.of()
            ));
            List<String> ids = resultado.stream()
                .map(r -> ((Bairro) r.get("bairro")).getId())
                .limit(5)
                .toList();
            h.setResultado(ids);
            historicoRepository.save(h);
        }

        return ResponseEntity.ok(resultado);
    }
}
