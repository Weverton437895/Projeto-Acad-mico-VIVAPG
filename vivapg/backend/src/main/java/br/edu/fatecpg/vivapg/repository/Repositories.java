package br.edu.fatecpg.vivapg.repository;

import br.edu.fatecpg.vivapg.model.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

// ── Usuario ──────────────────────────────────────────────
interface UsuarioRepositoryBase extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}

// ── Perfil ───────────────────────────────────────────────
interface PerfilRepositoryBase extends MongoRepository<Perfil, String> {
    Optional<Perfil> findByUsuarioId(String usuarioId);
}

// ── Bairro ───────────────────────────────────────────────
interface BairroRepositoryBase extends MongoRepository<Bairro, String> {
    List<Bairro> findByRegiao(String regiao);
    List<Bairro> findByTemPraiaTrue();
}

// ── Favorito ─────────────────────────────────────────────
interface FavoritoRepositoryBase extends MongoRepository<Favorito, String> {
    List<Favorito> findByUsuarioId(String usuarioId);
    Optional<Favorito> findByUsuarioIdAndBairroId(String usuarioId, String bairroId);
    void deleteByUsuarioIdAndBairroId(String usuarioId, String bairroId);
    boolean existsByUsuarioIdAndBairroId(String usuarioId, String bairroId);
}

// ── Comparacao ───────────────────────────────────────────
interface ComparacaoRepositoryBase extends MongoRepository<Comparacao, String> {
    List<Comparacao> findByUsuarioIdOrderBySalvoEmDesc(String usuarioId);
}

// ── Historico ────────────────────────────────────────────
interface HistoricoRepositoryBase extends MongoRepository<Historico, String> {
    List<Historico> findByUsuarioIdOrderByRealizadoEmDesc(String usuarioId);
}
