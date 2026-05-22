package br.edu.fatecpg.vivapg.repository;
import br.edu.fatecpg.vivapg.model.Historico;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface HistoricoRepository extends MongoRepository<Historico, String> {
    List<Historico> findByUsuarioIdOrderByRealizadoEmDesc(String usuarioId);
}
