var GraphQLSchema = require("graphql").GraphQLSchema;
var GraphQLObjectType = require("graphql").GraphQLObjectType;
var GraphQLList = require("graphql").GraphQLList;
var GraphQLObjectType = require("graphql").GraphQLObjectType;
var GraphQLInputObjectType = require("graphql").GraphQLInputObjectType;
var GraphQLNonNull = require("graphql").GraphQLNonNull;
var GraphQLID = require("graphql").GraphQLID;
var GraphQLString = require("graphql").GraphQLString;
var GraphQLInt = require("graphql").GraphQLInt;
var GraphQLDate = require("graphql-date");
// var ArtistModel = require("../models/Artist");
var UserModel = require("../models/User");
var GraphicalPlaylistModel = require("../models/GraphicalPlaylist");


var trackType = new GraphQLObjectType({
    name: "track",
    fields: function () {
      return {
        SpotifyTrackID: {
          type: GraphQLString,
        },
        name: {
          type: GraphQLString,
        },
      };
    },
  });
  
  var artistType = new GraphQLInputObjectType({
      name: "artist",
      fields: function () {
        return {
          SpotifyArtistID: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString,
          },
          tracks: {
            type: new GraphQLList(trackType),
          },
          q: {
            type: GraphQLInt,
          },
          r: {
            type: GraphQLInt,
          },
        };
      },
  });

var graphicalPlaylistType = new GraphQLInputObjectType({
    name: "graphicalPlaylist",
    fields: function () {
      return {
        _id: {
          type: GraphQLString,
        },
        name: {
          type: GraphQLString,
        },
        playlists: {
          type: new GraphQLList(GraphQLString),
        },
        artists: {
          type: new GraphQLList(artistType),
        },
        lastModified: {
          type: GraphQLDate,
        },
        privacyStatus: {
          type: GraphQLString,
        },
      };
    },
  });

var userType = new GraphQLObjectType({
  name: "user",
  fields: function () {
    return {
      _id: {
        type: GraphQLString,
      },
      SpotifyUserID: {
        type: GraphQLString,
      },
      graphicalPlaylists: {
        type: new GraphQLList(graphicalPlaylistType),
      },
    };
  },
});


var queryType = new GraphQLObjectType({
  name: "Query",
  fields: function () {
    return {
        graphicalPlaylists: {
        type: new GraphQLList(graphicalPlaylistType),
        resolve: function () {
          const graphicalPlaylists = GraphicalPlaylistModel.find().exec();
          if (!graphicalPlaylists) {
            throw new Error("Error");
          }
          return graphicalPlaylists;
        },
      },
      graphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          id: {
            name: "_id",
            type: GraphQLString,
          },
        },
        resolve: function (root, params) {
          const graphicalPlaylistsDetails = graphicalPlaylistModel.findById(params.id).exec();
          if (!graphicalPlaylistsDetails) {
            throw new Error("Error");
          }
          return graphicalPlaylistsDetails;
        },
      },
      users: {
        type: new GraphQLList(userType),
        resolve: function () {
          const users = UserModel.find().exec();
          if (!users) {
            throw new Error("Error");
          }
          return users;
        },
      },
      user: {
        type: userType,
        args: {
          id: {
            name: "_id",
            type: GraphQLString,
          },
        },
        resolve: function (root, params) {
          const userDetails = UserModel.findById(params.id).exec();
          if (!userDetails) {
            throw new Error("Error");
          }
          return userDetails;
        },
      },

    };
  },
});

var mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: function () {
    return {
      addGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
          playlists: {
            type: new GraphQLList(GraphQLString),
          },
          lastModified: {
            type: new GraphQLNonNull(GraphQLDate),
          },
          privacyStatus: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: function (root, params) {
          const graphicalPlatlistModel = new GraphicalPlatlistModel(params);
          const newGraphicalPlaylist = graphicalPlatlistModel.save();
          if (!newGraphicalPlaylist) {
            throw new Error("Error");
          }
          return newGraphicalPlaylist;
        },
      },
      updateGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          id: {
            name: "id",
            type: new GraphQLNonNull(GraphQLString),
          },
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
          playlists: {
            type: new GraphQLList(GraphQLString),
          },
          privacyStatus: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve(root, params) {
          return GraphicalPlaylistModel.findByIdAndUpdate(
            params.id,
            {
                name: params.name,
                playlists: params.playlists, 
                playlists: params.playlists,
                privacyStatus: params.privacyStatus,
                lastModified: new Date(),
            },
            function (err) {
              if (err) return next(err);
            }
          );
        },
      },
      removeGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve(root, params) {
          const remGraphicalPlaylist = GraphicalPlatlistModel.findByIdAndRemove(params.id).exec();
          if (!remGraphicalPlaylist) {
            throw new Error("Error");
          }
          return remGraphicalPlaylist;
        },
      }, 
      NewUserMutation: {
        type: userType,
        args: {
          SpotifyUserID: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: function (root, params) {
          const userModel = new UserModel(params);
          const newUser = userModel.save();
          if (!newUser) {
            throw new Error("Error");
          }
          return newUser;
        },
      },
      LoginMutation: {
        type: userType,
        args: {
          SpotifyUserID: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: function () {
          const user = UserModel.find().exec();
          if (!user) {
            throw new Error("Error");
          }
          return user;
        },
    },
    };
  },
});
module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });
