package br.edu.fatecpg.vivapg.controller;

import br.edu.fatecpg.vivapg.model.Bairro;
import br.edu.fatecpg.vivapg.repository.BairroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/bairros")
@RequiredArgsConstructor
public class BairroController {

    private final BairroRepository bairroRepository;

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        return ResponseEntity.ok(bairroRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable String id) {
        return bairroRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/regiao/{regiao}")
    public ResponseEntity<?> listarPorRegiao(@PathVariable String regiao) {
        return ResponseEntity.ok(bairroRepository.findByRegiao(regiao));
    }

    @GetMapping("/praia")
    public ResponseEntity<?> listarPraianos() {
        return ResponseEntity.ok(bairroRepository.findByTemPraiaTrue());
    }
}
