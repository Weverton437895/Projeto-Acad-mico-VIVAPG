package br.edu.fatecpg.vivapg.repository;
import br.edu.fatecpg.vivapg.model.Favorito;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
public interface FavoritoRepository extends MongoRepository<Favorito, String> {
    List<Favorito> findByUsuarioId(String usuarioId);
    Optional<Favorito> findByUsuarioIdAndBairroId(String usuarioId, String bairroId);
    void deleteByUsuarioIdAndBairroId(String usuarioId, String bairroId);
    boolean existsByUsuarioIdAndBairroId(String usuarioId, String bairroId);
}
