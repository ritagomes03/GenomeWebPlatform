# Pôr o site num servidor (passo a passo para principiantes)

Segue os passos **por ordem**. Copia cada comando tal como está. Não precisas de perceber tudo: só de fazer o que está escrito.

## Antes de começar: como ler este guia

- Cada comando diz **onde** o corres:
  - **[COMPUTADOR]** = no terminal do teu computador.
  - **[SERVIDOR]** = no Terminal ligado ao servidor (depois do passo 2).
- Linhas que começam por `#` são só comentários. Não as escrevas.
- Onde vires `<assim>`, troca pelo teu valor (sem os `< >`).
- Se um comando der erro, não continues. Vai à secção **"Se algo correr mal"** no fim.

---

## O que vais fazer (resumo)

1. Ligar ao servidor.
2. Pôr o código no servidor.
3. Enviar a pasta `hvgd` (os ficheiros grandes) do teu computador para o servidor.
4. Descompactar cada ficheiro e pô-lo na pasta certa.
5. Criar o ficheiro de configuração `.env`.
6. Arrancar o site.
7. Encher a base de dados.
8. Abrir o site no browser.

---

## O que tens na pasta `Documents/hvgd`

| Ficheiro na pasta `hvgd` | O que fazer com ele |
|---|---|
| `data/genomes.csv.zip` | **Descompactar** para `backend/data/` |
| `data/metadados.csv.zip` | **Descompactar** para `backend/data/` |
| `data/species_compressed/species_compressed.zip` | **Descompactar** para `backend/data/` (cria a pasta `species_compressed`) |
| `data/cncb_sequences.zip` | **Copiar sem descompactar** para `backend/data/` |
| `static/graphs.zip` | **Descompactar** para `backend/static/` (cria a pasta `graphs`) |
| `all_genomes_clean.fasta.zip` e `all_genomes_clean.fasta.zst` | Estão no servidor, na pasta `~/Rita`. **Copiar sem descompactar** para `backend/data/` |
| `data/graphs.zip` | **Ignorar.** É igual ao `static/graphs.zip`. |
| `data/all_genomes_clean.fasta.txt` | **Ignorar.** É só uma nota. |
| ficheiros `.DS_Store` (se existirem) | **Ignorar.** São ficheiros de sistema sem utilidade. |

**Regra importante:** só o `cncb_sequences.zip` e os dois ficheiros `all_genomes_clean...` ficam **fechados** (zip/zst). Todos os outros são descompactados.

No fim, a pasta do projeto no servidor tem de ficar assim:

```
GenomeWebPlatform/
├── .env                                  (crias no passo 5)
└── backend/
    ├── data/
    │   ├── metadados.csv                 (do metadados.csv.zip)
    │   ├── genomes.csv                   (do genomes.csv.zip)
    │   ├── species_compressed/           (pasta com muitos .zip lá dentro)
    │   ├── cncb_sequences.zip            (fechado)
    │   ├── all_genomes_clean.fasta.zip   (fechado)
    │   └── all_genomes_clean.fasta.zst   (fechado)
    └── static/
        └── graphs/                       (pasta com os PDFs, do graphs.zip)
```

---

## Passo 1: Confirmar o que o servidor tem

**[SERVIDOR]** Liga-te ao servidor (passo 2) e corre isto. Se algum der "command not found", instala-o.

```bash
docker --version
docker compose version
git --version
unzip -v | head -1
```

Se faltar alguma coisa:
```bash
sudo apt install unzip git          # unzip e git
```
Para o Docker, segue o guia oficial: https://docs.docker.com/engine/install/

---

## Passo 2: Ligar ao servidor

**[COMPUTADOR]**
```bash
ssh rg@sapiens
```
Escreve a palavra-passe quando pedir (não aparece nada enquanto escreves, é normal). Quando vires `rg@sapiens:~$`, estás dentro do servidor.

Para sair do servidor no fim: `exit`.

---

## Passo 3: Pôr o código no servidor

**[SERVIDOR]**
```bash
cd ~
git clone <endereço-do-repositório> GenomeWebPlatform
```
Isto cria a pasta `GenomeWebPlatform`. Confirma:
```bash
ls ~/GenomeWebPlatform
```
Deves ver `backend`, `frontend`, `nginx`, `docker-compose.prod.yml`, etc.

---

## Passo 4: Enviar a pasta `hvgd` para o servidor

**[COMPUTADOR]** Num terminal **novo** (não no que está ligado ao servidor):
```bash
rsync -avh --progress --exclude='.DS_Store' ~/Documents/hvgd/ rg@sapiens:~/hvgd/
```
Isto copia a pasta `hvgd` inteira para o servidor (cerca de 300 MB). Espera até acabar e voltares a ver o prompt.

Se der "rsync: command not found", usa isto:
```bash
scp -r ~/Documents/hvgd rg@sapiens:~/
```

---

## Passo 5: Pôr cada ficheiro no sítio certo

**[SERVIDOR]** Corre estes comandos **um bloco de cada vez**.

### 5.1 Ficheiros da pasta `data`
```bash
cd ~/GenomeWebPlatform/backend
mkdir -p data
cd data

# CSVs: descompactar
unzip ~/hvgd/data/metadados.csv.zip
unzip ~/hvgd/data/genomes.csv.zip

# Zips por espécie: descompactar (cria a pasta species_compressed)
unzip ~/hvgd/data/species_compressed/species_compressed.zip

# CNCB: copiar SEM descompactar
cp ~/hvgd/data/cncb_sequences.zip .
```

### 5.2 Os dois ficheiros do FASTA completo (estão em `~/Rita`)
```bash
cp ~/Rita/all_genomes_clean.fasta.zip ~/GenomeWebPlatform/backend/data/
cp ~/Rita/all_genomes_clean.fasta.zst ~/GenomeWebPlatform/backend/data/
```
Se o ficheiro `.zst` ainda não existir, cria-o (demora; corre em segundo plano):
```bash
cd ~/Rita
nohup zstd -T0 -19 all_genomes_clean.fasta -o all_genomes_clean.fasta.zst > zstd.log 2>&1 &
```
(Se der "zstd: command not found": `sudo apt install zstd`.) Quando acabar, volta a correr o `cp` acima.

### 5.3 Os gráficos
```bash
cd ~/GenomeWebPlatform/backend
mkdir -p static
cd static
unzip ~/hvgd/static/graphs.zip
```

### 5.4 Confirmar que ficou tudo no sítio
```bash
cd ~/GenomeWebPlatform/backend
ls -lh data
ls data/species_compressed | head -3
ls static/graphs | head -3
```
Tens de ver:
- em `data`: `metadados.csv`, `genomes.csv`, `species_compressed`, `cncb_sequences.zip`, `all_genomes_clean.fasta.zip`, `all_genomes_clean.fasta.zst`
- vários `.zip` dentro de `species_compressed`
- várias pastas de espécies dentro de `graphs`

Se faltar alguma coisa, repete o bloco desse ficheiro.

### 5.5 Limpar (opcional)
Depois de tudo funcionar, podes apagar a cópia para poupar espaço:
```bash
rm -r ~/hvgd
```
(Faz isto **só no fim**. Se te enganares, tens de enviar tudo outra vez.)

---

## Passo 6: Criar o ficheiro `.env`

O `.env` guarda as palavras-passe do site. **Não o partilhes com ninguém.**

**[SERVIDOR]**
```bash
cd ~/GenomeWebPlatform
nano .env
```
Vai abrir um editor. Cola isto e **troca os valores**:

```env
DB_NAME=viraldb
DB_USER=viral
DB_PASSWORD=escreve-uma-palavra-passe-forte
DB_ROOT_PASSWORD=escreve-outra-palavra-passe-forte

DJANGO_SECRET_KEY=cola-aqui-a-chave-gerada-abaixo
DJANGO_ALLOWED_HOSTS=<ip-do-servidor>,<dominio-se-tiveres>
DJANGO_CSRF_TRUSTED_ORIGINS=http://<ip-do-servidor>
```

Para guardar: carrega em `Ctrl+O`, depois `Enter`, depois `Ctrl+X`.

**Gerar a chave secreta** (copia o resultado para `DJANGO_SECRET_KEY`):
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Ver o IP do servidor:**
```bash
hostname -I
```

Se tiveres domínio com HTTPS, usa `https://oteudominio.pt` em `DJANGO_CSRF_TRUSTED_ORIGINS`.

---

## Passo 7: Arrancar o site

**[SERVIDOR]**
```bash
cd ~/GenomeWebPlatform
docker compose -f docker-compose.prod.yml up -d --build
```
Na primeira vez demora alguns minutos. No fim confirma:
```bash
docker compose -f docker-compose.prod.yml ps
```
Deves ver 3 serviços (`db`, `backend`, `nginx`) com o estado `Up`.

---

## Passo 8: Encher a base de dados

Esta parte lê o `metadados.csv` e o `genomes.csv` e pode demorar **muito tempo** (horas, se os dados forem muito grandes). Corre-a em segundo plano para não perderes tudo se a ligação cair:

**[SERVIDOR]**
```bash
cd ~/GenomeWebPlatform
nohup docker compose -f docker-compose.prod.yml exec -T backend python manage.py populate_db > populate.log 2>&1 &
```
O terminal fica livre. Vê como vai:
```bash
tail -f populate.log      # Ctrl+C para deixar de ver (não pára a importação)
```
Quando aparecer **`Import completed successfully!`**, acabou.

**Atenção:**
- Este comando **apaga** os dados que já estiverem na base de dados e importa tudo de novo. Só o uses a primeira vez, ou quando quiseres mesmo recomeçar.
- Se a importação falhar a meio, tem de recomeçar do princípio.
- Se os dados completos forem **muito** maiores do que os de agora, diz-me, porque há uma forma mais segura de importar.

---

## Passo 9: Ver o site

Abre no browser do teu computador:
```
http://<ip-do-servidor>
```
Confirma também no servidor:
```bash
curl -s http://localhost/api/global/stats/
```
Deve aparecer um texto com números (espécies e sequências).

**O que testar no site:**
1. A lista de espécies aparece.
2. Abre uma espécie: os gráficos aparecem?
3. Clica em descarregar a espécie: o zip descarrega?
4. Na lista de espécies, testa os botões "todos os FASTA" (zip e Zstandard).

---

## Comandos que vais precisar mais tarde

Corre-os em **[SERVIDOR]**, dentro de `~/GenomeWebPlatform`.

| O que queres | Comando |
|---|---|
| Ver se está a correr | `docker compose -f docker-compose.prod.yml ps` |
| Ver os registos (erros) | `docker compose -f docker-compose.prod.yml logs -f backend` |
| Reiniciar o site | `docker compose -f docker-compose.prod.yml restart` |
| Parar o site (os dados ficam) | `docker compose -f docker-compose.prod.yml down` |
| Atualizar depois de mudar o código | `git pull` e depois `docker compose -f docker-compose.prod.yml up -d --build` |

> **NUNCA escrevas `docker compose down -v`.** O `-v` apaga a base de dados inteira.

---

## Se algo correr mal

| Problema | O que fazer |
|---|---|
| `command not found` (por exemplo `unzip`, `zstd`, `docker`) | Falta instalar. Para `unzip` e `zstd`: `sudo apt install unzip zstd`. |
| `No such file or directory` ao descompactar | Os ficheiros não chegaram ao servidor. Repete o **passo 4** e vê com `ls ~/hvgd`. |
| Um gráfico ou um download dá erro 404 | O ficheiro não está no sítio certo. Volta ao **passo 5.4** e confirma a lista. |
| Erro `DisallowedHost` ou CSRF no browser | O IP no `.env` está errado. Edita o `.env` (`nano .env`) e depois `docker compose -f docker-compose.prod.yml restart backend`. |
| O `backend` reinicia sem parar | Corre `docker compose -f docker-compose.prod.yml logs backend` e vê a última linha. Quase sempre é a palavra-passe da base de dados. Se a mudaste depois do primeiro arranque, apaga o volume só se ainda não importaste nada, ou pede ajuda. |
| O site abre mas não mostra espécies | A base de dados está vazia. Faz o **passo 8**. |
| Sem espaço no disco | Corre `df -h`. Podes apagar `~/hvgd` (passo 5.5). |
| Não consegues abrir o site no browser | A porta 80 pode estar fechada na firewall do servidor. Pede ao administrador para a abrir. |

Se continuares preso, copia a **mensagem de erro completa** (e o comando que corriste) e pede ajuda com isso.
