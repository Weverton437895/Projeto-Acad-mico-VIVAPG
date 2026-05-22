package br.edu.fatecpg.vivapg.repository;
import br.edu.fatecpg.vivapg.model.Perfil;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
public interface PerfilRepository extends MongoRepository<Perfil, String> {
    Optional<Perfil> findByUsuarioId(String usuarioId);
}
