'use strict';
const express = require('express');
const app = express();
const corePlayer = require('./../core/player');

module.exports = (client) => {
    /** Setup control origin */
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods',
            'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers',
            'X-Requested-With, Content-Type, Authorization');
        if ('OPTIONS' == req.method) {
          res.sendStatus(204);
        } else {
          next();
        };
    });

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.get('/api/:id/playlists', (req, res) => {
        const player = corePlayer.initPlayer(client, req.params.id);
        return res.status(202).json({
            queue: player.queue,
            index: player.index,
            isPlaying: player.isPlaying,
            volume: player.volume,
            type: player.type,
        });
    });

    app.listen(client.config.port, '0.0.0.0', () => console.log(`server listening on http://localhost:${client.config.port}`))
};
