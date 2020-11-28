var GraphQLSchema = require("graphql").GraphQLSchema;
var GraphQLObjectType = require("graphql").GraphQLObjectType;
var GraphQLList = require("graphql").GraphQLList;
var GraphQLObjectType = require("graphql").GraphQLObjectType;
var GraphQLInputObjectType = require("graphql").GraphQLInputObjectType;
var GraphQLInputObjectType = require("graphql").GraphQLInputObjectType;
var GraphQLNonNull = require("graphql").GraphQLNonNull;
var GraphQLID = require("graphql").GraphQLID;
var GraphQLString = require("graphql").GraphQLString;
var GraphQLInt = require("graphql").GraphQLInt;
var GraphQLDate = require("graphql-date");
var UserModel = require("../models/User");
var GraphicalPlaylistModel = require("../models/GraphicalPlaylist");

var userType = new GraphQLObjectType({
  name: "user",
  fields: function () {
    return {
      id: {
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

var nodeType = new GraphQLObjectType({
  name: "node",
  fields: function() {
    return {
      q: {
        type: GraphQLInt,
      },
      r: {
        type: GraphQLInt,
      },
      artistId: {
        type: new GraphQLNonNull(GraphQLString),
      },
    };
  },
});

var trackType = new GraphQLObjectType({
  name: "track",
  fields: function() {
    return {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      uri: {
        type: new GraphQLNonNull(GraphQLString),
      },
    };
  },
});

var trackInput = new GraphQLInputObjectType({
  name: "trackInput",
  fields: function() {
    return {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      uri: {
        type: new GraphQLNonNull(GraphQLString),
      },
    };
  },
});

var artistType = new GraphQLObjectType({
  name: "artist",
  fields: function() {
    return {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      tracks: {
        type: new GraphQLList(trackType),
      }
    };
  },
});

var graphicalPlaylistType = new GraphQLObjectType({
  name: "graphicalPlaylist",
  fields: function () {
    return {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      owner: {
        type: new GraphQLNonNull(GraphQLString),
      },
      playlists: {
        type: new GraphQLList(GraphQLString),
      },
      artists: {
        type: new GraphQLList(artistType),
      },
      nodes: {
        type: new GraphQLList(nodeType),
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
      retreiveGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          id: {
            name: "id",
            type: GraphQLString,
          },
        },
        resolve: function (root, params) {
          const graphicalPlaylistsDetails = GraphicalPlaylistModel.findById(params.id).exec();
          if (!graphicalPlaylistsDetails) {
            throw new Error("Error");
          }
          return graphicalPlaylistsDetails;
        },
      },
      user: {
        type: userType,
        args: {
        },
        resolve: function (root, params, user_id) {
          const userDetails = UserModel.findOne({ SpotifyUserID: user_id }).exec();
          userDetails.id = user_id;
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
      createGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
          privacyStatus: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: async function (root, params, user_id) {
          if (user_id === "") {
            throw new Error("Log in first");
          }
          const user = await UserModel.findOne({ SpotifyUserID: user_id });
          const graphicalPlaylist = new GraphicalPlaylistModel({
            owner: user_id,
            name: params.name,
            playlists: [],
            artists: [],
            nodes: [],
            privacyStatus: params.privacyStatus
          });
          graphicalPlaylist.save();
          user.graphicalPlaylists.push(graphicalPlaylist);
          user.save();
          if (!graphicalPlaylist) {
            throw new Error("Error");
          }
          return graphicalPlaylist;
        },
      },
      updateNode: {
        type: graphicalPlaylistType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
          q: {
            type: GraphQLInt,
          },
          r: {
            type: GraphQLInt,
          },
          artistId: {
            type: new GraphQLNonNull(GraphQLString),
          },
          artistName: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: async function(root, params) {
          graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
          if (!graphicalPlaylist) {
            throw new Error("Error");
          }
          if (!graphicalPlaylist.artists.find(artist => artist.id === params.artistId)) {
            graphicalPlaylist.artists.push({
              id: params.artistId,
              name: params.artistName,
              tracks: [],
            });
          }
          const newNode = {
            q: params.q,
            r: params.r,
            artistId: params.artistId,
          };
          const index = graphicalPlaylist.nodes.findIndex(node => node.q === params.q && node.r === params.r);
          if (index >= 0) {
            const deletedArtistId = graphicalPlaylist.nodes[index].artistId;
            graphicalPlaylist.nodes.splice(index, 1);
            if (graphicalPlaylist.nodes.find(node => node.artistId === deletedArtistId) === undefined) {
              graphicalPlaylist.artists.splice(
                graphicalPlaylist.artists.findIndex(artist => artist.id === deletedArtistId),
                1
              );
            }
          }
          graphicalPlaylist.nodes.push(newNode);
          graphicalPlaylist.lastModified = Date.now();
          graphicalPlaylist.save();
          return graphicalPlaylist;
        }
      },
      updateTracks: {
        type: graphicalPlaylistType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
          artistId: {
            type: new GraphQLNonNull(GraphQLString),
          },
          artistName: {
            type: new GraphQLNonNull(GraphQLString),
          },
          tracks: {
            type: new GraphQLList(trackInput),
          }
        },
        resolve: async function(root, params) {
          graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
          if (!graphicalPlaylist) {
            throw new Error("Error");
          }
          if (!graphicalPlaylist.artists.find(artist => artist.id === params.artistId)) {
            graphicalPlaylist.artists.push({
              id: params.artistId,
              name: params.artistName,
              tracks: params.tracks,
            });
          }
          else{
            // var i = graphicalPlaylist.artists.findIndex(artist => artist.id === params.artistId);
            // graphicalPlaylist.artists[i].tracks = params.tracks;
            for(let i = 0; i < graphicalPlaylist.artists.length; i++){
              if(graphicalPlaylist.artists[i].id === params.artistId){
                const cp = {...graphicalPlaylist.artists[i]}; 
                cp.tracks.push({id: params.tracks[0].id, name: params.tracks[0].name, uri: params.tracks[0].uri}); 
                graphicalPlaylist.artists.set(i, cp);
              }
            }
          }
          graphicalPlaylist.lastModified = Date.now();
          // console.log("save():", graphicalPlaylist.save());
          console.log(graphicalPlaylist.artists[0].tracks);
          console.log(graphicalPlaylist.artists[0].tracks.length)
          graphicalPlaylist.save().then((res)=> console.log(res));
          return graphicalPlaylist;
        }
      },
      deleteNode: {
        type: graphicalPlaylistType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
          q: {
            type: GraphQLInt,
          },
          r: {
            type: GraphQLInt,
          },
        },
        resolve: async function(root, params) {
          graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
          if (!graphicalPlaylist) {
            throw new Error("Error");
          }
          const index = graphicalPlaylist.nodes.findIndex(node => node.q === params.q && node.r === params.r);
          if (index >= 0) {
            const deletedArtistId = graphicalPlaylist.nodes[index].artistId;
            graphicalPlaylist.nodes.splice(index, 1);
            if (graphicalPlaylist.nodes.find(node => node.artistId === deletedArtistId) === undefined) {
              graphicalPlaylist.artists.splice(
                graphicalPlaylist.artists.findIndex(artist => artist.id === deletedArtistId),
                1
              );
            }
          }
          graphicalPlaylist.lastModified = Date.now();
          graphicalPlaylist.save();
          return graphicalPlaylist;
        }
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
                lastModified: Date.now(),
            },
            function (err) {
              if (err) return next(err);
            }
          );
        },
      },
      deleteGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve(root, params) {
          const remGraphicalPlaylist = GraphicalPlaylistModel.findByIdAndRemove(params.id).exec();
          if (!remGraphicalPlaylist) {
            throw new Error("Error");
          }
          return remGraphicalPlaylist;
        },
      }, 
    };
  },
});
module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });
