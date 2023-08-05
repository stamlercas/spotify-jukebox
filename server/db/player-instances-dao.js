const db = require('./conn');
var SpotifyPlayerUtils = require('../util/spotify-player-utils.js');

const PLAYER_COLLECTION = "PlayerInstances";

module.exports = {
    insert: function (playerId, creator, accessToken = null, refreshToken = null) {
        let document = {
            playerId: playerId,
            creator: creator,
            users: [
                creator
            ],
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiration: new Date(Date.now() + SpotifyPlayerUtils.TIME_TO_LIVE),
            isExpired: false,
            tracks: []
        }
        db.getDb().collection(PLAYER_COLLECTION).insertOne(document);
    },

    update: (playerId, update) => db.getDb().collection(PLAYER_COLLECTION).updateOne({playerId: playerId, isExpired: false}, {$set: update}),

    addTrack: (playerId, userId, track) => db.getDb().collection(PLAYER_COLLECTION).updateOne({playerId: playerId}, {$push: { tracks: {userId: userId, track: track} }}),

    addUser: (playerId, userId) => db.getDb().collection(PLAYER_COLLECTION).updateOne({playerId: playerId}, {$push: {users: userId}}),

    find: (playerId) => db.getDb().collection(PLAYER_COLLECTION).findOneAndUpdate(
        {playerId: playerId, isExpired: false}, 
        {$set: {expiration: new Date(Date.now() + SpotifyPlayerUtils.TIME_TO_LIVE)}}).then(result => result.value),

    findAll: () => db.getDb().collection(PLAYER_COLLECTION).find({isExpired: false}),

    findAllByUser: (userId) => db.getDb().collection(PLAYER_COLLECTION).find({users: {$in: [userId]}, isExpired: false}),
    
    delete: (playerId) => db.getDb().collection(PLAYER_COLLECTION).updateOne({playerId: playerId}, {$set: {isExpired: true}})
  };