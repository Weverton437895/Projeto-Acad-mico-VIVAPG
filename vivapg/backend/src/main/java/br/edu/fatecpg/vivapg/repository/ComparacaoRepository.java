package br.edu.fatecpg.vivapg.repository;
import br.edu.fatecpg.vivapg.model.Comparacao;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface ComparacaoRepository extends MongoRepository<Comparacao, String> {
    List<Comparacao> findByUsuarioIdOrderBySalvoEmDesc(String usuarioId);
}
