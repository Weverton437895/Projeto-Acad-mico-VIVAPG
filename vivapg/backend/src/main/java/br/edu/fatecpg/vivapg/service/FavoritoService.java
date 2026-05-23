package br.edu.fatecpg.vivapg.service;

import br.edu.fatecpg.vivapg.model.*;
import br.edu.fatecpg.vivapg.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final BairroRepository bairroRepository;

    public Favorito salvar(String usuarioId, String bairroId) {
        if (favoritoRepository.existsByUsuarioIdAndBairroId(usuarioId, bairroId)) {
            throw new RuntimeException("Bairro já está nos favoritos");
        }
        Favorito f = new Favorito();
        f.setUsuarioId(usuarioId);
        f.setBairroId(bairroId);
        return favoritoRepository.save(f);
    }

    public void remover(String usuarioId, String bairroId) {
        favoritoRepository.deleteByUsuarioIdAndBairroId(usuarioId, bairroId);
    }

    public List<Map<String, Object>> listar(String usuarioId) {
        List<Favorito> favs = favoritoRepository.findByUsuarioId(usuarioId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Favorito f : favs) {
            bairroRepository.findById(f.getBairroId()).ifPresent(b -> {
                result.add(Map.of("favorito", f, "bairro", b));
            });
        }
        return result;
    }
}
