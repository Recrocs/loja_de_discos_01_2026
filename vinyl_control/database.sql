CREATE DATABASE IF NOT EXISTS loja_discos_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loja_discos_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS movimentacao_estoque;
DROP TABLE IF EXISTS disco;
DROP TABLE IF EXISTS usuario;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE disco (
  id_disco INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  artista VARCHAR(100) NOT NULL,
  genero VARCHAR(50) NOT NULL,
  preco_custo DECIMAL(10,2) NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  quantidade_estoque INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 0
);

CREATE TABLE movimentacao_estoque (
  id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
  id_disco INT NOT NULL,
  id_usuario INT NOT NULL,
  tipo_movimentacao ENUM('entrada','saida') NOT NULL,
  quantidade INT NOT NULL,
  data_movimentacao DATE NOT NULL,
  observacao VARCHAR(250),
  CONSTRAINT fk_mov_disco FOREIGN KEY (id_disco) REFERENCES disco(id_disco)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mov_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Senhas abaixo são hashes bcrypt válidos para a senha de demonstração Vinyl123!
-- Seed Prisma recria os usuários com hashes gerados localmente.
INSERT INTO usuario (nome, email, senha) VALUES
('Administrador', 'admin@vinyl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Ana Operadora', 'ana@vinyl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('Carlos Operador', 'carlos@vinyl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

INSERT INTO disco (titulo, artista, genero, preco_custo, preco_venda, quantidade_estoque, estoque_minimo) VALUES
('Abbey Road', 'The Beatles', 'Rock', 65.00, 110.00, 12, 4),
('Clube da Esquina', 'Milton Nascimento e Lô Borges', 'MPB', 55.00, 95.00, 7, 3),
('The Dark Side of the Moon', 'Pink Floyd', 'Rock Progressivo', 70.00, 125.00, 2, 5),
('Thriller', 'Michael Jackson', 'Pop', 60.00, 105.00, 9, 3),
('Transa', 'Caetano Veloso', 'MPB', 50.00, 90.00, 6, 2);

INSERT INTO movimentacao_estoque (id_disco, id_usuario, tipo_movimentacao, quantidade, data_movimentacao, observacao) VALUES
(1, 1, 'entrada', 1, CURRENT_DATE, 'Movimentação de exemplo'),
(2, 2, 'saida', 1, CURRENT_DATE, 'Venda de demonstração'),
(3, 3, 'entrada', 3, CURRENT_DATE, 'Reposição de demonstração');
