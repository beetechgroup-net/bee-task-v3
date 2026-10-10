# Diretrizes do Projeto: new-frontend (Bee Task v3)

Este arquivo contém as diretrizes e boas práticas para o desenvolvimento do novo frontend do sistema Bee Task.

## 1. Componentes
- **Uso do HeroUI**: Sempre que possível, dê preferência para a utilização dos componentes nativos do **HeroUI v3**.
- Evite criar componentes customizados do zero para elementos de interface comuns (como botões, inputs, modais, etc.) se já houver uma alternativa equivalente e madura na biblioteca.

## 2. Estilização e Temas
- **Tailwind CSS v4**: O projeto utiliza a versão mais recente do Tailwind de forma integrada.
- **Tema Centralizado**: Sempre utilize o CSS definido no arquivo global `src/index.css` e as variáveis do nosso tema customizado.
- Evite espalhar cores em hexadecimal ou estilos repetitivos diretamente no código `className`; utilize as variáveis globais de cor e estilo do tema para manter uma identidade visual coerente e facilitar a manutenção.

## 3. Tecnologias
- **React 19 + TypeScript**: Manter tipagem estrita para maior segurança.
- **Vite**: Usado para tooling rápido e eficiente.
