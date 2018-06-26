# Albion Discord bot
Commande passée le `19/05/18` avec un délai de 2 mois maximum pour la livraison.

Bot [Discord](http://discordapp.com/) pour un serveur d'une guilde du jeu [Albion](https://albiononline.com/en/home) permettant la gestion des donations et des joueurs de celle-ci.

Première version stable en ligne le `26/06/18` utilisant le micro framework [@tanuki/discord-bot-base](https://github.com/nooneexpectme/discord-bot-base).

## Commandes
- **register-loot** `<player>` `<resource>` `<amount>`
[Admin uniquement] Ajoutera au joueur un nombre de point en fonction du **nombre** de **ressource** qu'il a donné mutliplié par le _rate_.

- **update-config**
[Admin uniquement] Prend en compte les mises à jour de votre fichier de configuration.

- **event-create** `<name>` `<date>` `<description>`
Créer un évenement et lui attribut une référence automatiquement.

- **event-delete** `<ref>`
Supprime l'événements d'après sa **référence**.

- **job** `<job>` `<tier>`
Change le **métier** et **tier** de la personne qui éxecute la commande.

- **stats** `[user]`
Affiche dans le channel où la commande a été effectuée les statistiques du joueur, à savoir le nombre de points qu'il a au total et ceux de cette semaine ainsi que le nombre de points qu'il lui faut cette semaine.
    - `user` peut être un utilisateur discord (mention), qui retournerait les stats d'un joueur en particulier.

- **ranking** `[type]`
Retourne le classement des joueurs ayant le plus de points de la semaine.
    - `type` peut être égal à "global" qui retournerait le classement depuis le début.

- **deads**
Retourne un tableau avec les guildes nous focus.

### Rate
_Je donne 100 Bois T5._

Le ratio se calcule en divisant les 100 Bois que je donne par la totalité des bois dont a besoin multiplié par le tier du bois que je donne.

## Fonctionnement
Lorsqu'un joueur rejoint le serveur, il doit éxecuter la commande `job` pour renseigner son *métier* et *tier*.

Toutes les semaines il a un quota de donations à effectuer en jeu (sur _Albion_, il place ses objets dans un coffre) et l'administrateur utilisera la commande `register-loot` pour mettre à jour les points des joueurs sur _Discord_.

L'administrateur peut planifier des événements grâce à la commande `event-create` et les supprimer avec `event-delete`.

Lorsqu'un événement est crée, un message est envoyé dans un channel spécifique et chaques joueurs pourra y mettre une [réaction](https://www.youtube.com/watch?v=pWg1uwwtB9o) pour confirmer leur participation.

Un message privé est également envoyé aux participants des événements 24h, 2h, 30 minutes et 10 minutes avant qu'il débute pour le leur rappeler.

## Installation
Dans votre terminal:
```
# Téléchargement du dépôt du projet
$ git clone REPOSITORY_URL

# Déplacement dans le dossier téléchargé
$ cd discord-albion-bot/         

# Installation des dépendances
$ npm i && npm i --save @tanuki/discord-bot-base

# Compilation du projet
$ tsc -p .

# On lance le bot pour la première fois
$ sh debug.sh
```

Sur discord:
1. Invitez le bot dans votre serveur.
2. Executez la commande `!eval this.client.shared.get('storage').regenDefaultTables()` qui va générer la base de données.
3. Redémarrez entièrement le bot depuis votre terminal, `CTRL` + `C` puis `sh debug.sh`.

![Console après la dernière étape](https://i.imgur.com/lGjpFO9.png)