package br.edu.fatecpg.vivapg.repository;
import br.edu.fatecpg.vivapg.model.Bairro;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface BairroRepository extends MongoRepository<Bairro, String> {
    List<Bairro> findByRegiao(String regiao);
    List<Bairro> findByTemPraiaTrue();
}
