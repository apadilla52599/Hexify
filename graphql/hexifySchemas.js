var GraphQLSchema = require("graphql").GraphQLSchema;
var GraphQLObjectType = require("graphql").GraphQLObjectType;
var GraphQLList = require("graphql").GraphQLList;
var GraphQLInputObjectType = require("graphql").GraphQLInputObjectType;
var GraphQLNonNull = require("graphql").GraphQLNonNull;
var GraphQLString = require("graphql").GraphQLString;
var GraphQLInt = require("graphql").GraphQLInt;
var GraphQLDate = require("graphql-date");
var UserModel = require("../models/User");
var GraphicalPlaylistModel = require("../models/GraphicalPlaylist");
const { GraphQLScalarType } = require("graphql");

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

var nodeInput = new GraphQLInputObjectType({
  name: "nodeInput",
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

var artistInput = new GraphQLInputObjectType({
  name: "artistInput",
  fields: function() {
    return {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      tracks: {
        type: new GraphQLList(trackInput),
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
      searchGraphicalPlaylists: {
        type: new GraphQLList(graphicalPlaylistType),
        args:{
          name: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: function (root, params) {
          const regex = new RegExp(escapeRegex(params.name), "gi");
          const graphicalPlaylists = GraphicalPlaylistModel.find({name: regex}).exec();
          if (!graphicalPlaylists) {
            throw new Error("Error");
          }
          return graphicalPlaylists;
        },
      },
      retrieveGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          id: {
            name: "id",
            type: GraphQLString,
          },
        },
        resolve: async function (root, params, user_id) {
          const graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
          if (!graphicalPlaylist) {
            throw new Error("Log in first");
          }
          if (graphicalPlaylist.owner !== user_id) {
              if (graphicalPlaylist.privacyStatus === "private")
                throw new Error("Not your playlist");
              else {
                  const cp = {...graphicalPlaylist.toObject()};
                  cp.owner = user_id;
                  const newGraphicalPlaylist = new GraphicalPlaylistModel(cp);
                  newGraphicalPlaylist.save();
                  const user = await UserModel.findOne({ SpotifyUserID: user_id }).exec();
                  user.raphicalPlaylists.push(newGraphicalPlaylist._id.toString());
              }
          }
          return graphicalPlaylist;
        },
      },
      user: {
        type: userType,
        args: {
        },
        resolve: async function (root, params, user_id) {
          const user = await UserModel.findOne({ SpotifyUserID: user_id }).exec();
          if (!user) {
            throw new Error("Error");
          }
          user.id = user_id;
          const cp = {...user.toObject()};
          const graphicalPlaylists = await Promise.all(user.graphicalPlaylists.map(async graphicalPlaylistId => {
              const graphicalPlaylist = await GraphicalPlaylistModel.findById(graphicalPlaylistId).exec();
              return {
                  id: graphicalPlaylistId,
                  ...graphicalPlaylist.toObject()
              }
          }));
          cp.graphicalPlaylists = graphicalPlaylists;
          return cp;
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
          const user = await UserModel.findOne({ SpotifyUserID: user_id }).exec();
          const graphicalPlaylist = new GraphicalPlaylistModel({
            owner: user_id,
            name: params.name,
            playlists: [],
            artists: [],
            nodes: [],
            privacyStatus: params.privacyStatus
          });
          graphicalPlaylist.save();
          user.graphicalPlaylists.push(graphicalPlaylist._id.toString());
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
          const graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
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
          tracks: {
            type: new GraphQLList(trackInput),
          }
        },
        resolve: async function(root, params) {
          const graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
          if (!graphicalPlaylist) {
            throw new Error("Error");
          }
          for(let i = 0; i < graphicalPlaylist.artists.length; i++){
            if(graphicalPlaylist.artists[i].id === params.artistId){
              const cp = {...graphicalPlaylist.artists[i]}; 
              cp.tracks = params.tracks; 
              graphicalPlaylist.artists.set(i, cp);
            }
          }
          graphicalPlaylist.lastModified = Date.now();
          graphicalPlaylist.save();
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
          const graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
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
            type: new GraphQLNonNull(GraphQLString),
          },
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
          artists: {
            type: new GraphQLList(artistInput),
          },
          nodes: {
            type: new GraphQLList(nodeInput),
          },
          privacyStatus: {
            type: GraphQLString,
          },
        },
        resolve: async function(root, params, user_id) {
          const graphicalPlaylist = await GraphicalPlaylistModel.findById(params.id).exec();
          if (graphicalPlaylist.owner === user_id) {
              graphicalPlaylist.name = params.name;
              graphicalPlaylist.artists = params.artists;
              graphicalPlaylist.nodes = params.nodes;
              graphicalPlaylist.privacyStatus = params.privacyStatus;
              graphicalPlaylist.save();
              return graphicalPlaylist;
          }
          throw new Error("Log in first");
        },
      },
      deleteGraphicalPlaylist: {
        type: graphicalPlaylistType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: async function(root, params, user_id) {
          if (user_id === "") {
            throw new Error("Log in first");
          }
          const user = await UserModel.findOne({ SpotifyUserID: user_id });
          if (user === null)
            throw new Error("User not found");
          const index = user.graphicalPlaylists.indexOf(params.id);
          if (index >= 0) {
            user.graphicalPlaylists.splice(index, 1);
            user.save();
            GraphicalPlaylistModel.deleteOne({_id: params.id}).exec();
            return {
                id: params.id,
                name: "fake name",
                owner: user_id,
                playlists: [],
                artists: [],
                nodes: [],
                lastModified: Date.now(),
                privacyStatus: "fake privacy status"
            }
          }
          throw new Error("Desmond the moon bear");
        },
      }, 
    };
  },
});

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });
