import { SolWebSocketDataReq } from '../models/dtos';
import { OrbitBody } from '../models/models';

var scaleFactor = 1e8
var inverseGravConst = 1 / (6.67408 * Math.pow(10, -11))

var ConvertOldSolSystems = (b: any) => {
    var result: OrbitBody =  {
        RenderData : {
            Name: b.name,
            PixelRadius: b.pixelSize,
            Color: b.color,
            Luminosity: 0,
            Path: []
        },
        Mass: b.mass,
        Radius: 1,
        Position: {
            X: b.x,
            Y: b.y,
            Z: b.z
        },
        Momentum: {
            Dx: b.dx,
            Dy: b.dy,
            Dz: b.dz
        }
    }

    return result;
}


var threeBodyMoth = [
    {
        "name": "Body1",
        "pixelSize": 6,
        "color": "red",
        "x": -1 * scaleFactor,                                                                 
        "y": 0,
        "z": 0,
        "dx": 0.439166,
        "dy": 0.452968,
        "dz": 0,                                                                
        "mass": 1 * scaleFactor * inverseGravConst,
    },

    {
        "name": "Body2",
            "pixelSize": 6,
            "color": "green",
            "x": 1 * scaleFactor,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0.439166,
            "dy": 0.452968,
            "dz": 0,                                                                
            "mass": 1 *scaleFactor * inverseGravConst,
            "lines":  []                                 
    },

    {
        "name": "Body3",
        "pixelSize": 6,
        "color": "blue",
        "x": 0,                                                                 
        "y": 0,
        "z": 0,
        "dx": 0.439166 * -2,
        "dy": 0.452968 * -2,
        "dz": 0,                                                                
        "mass": 1 * scaleFactor * inverseGravConst,
        "lines":  []                                 
    },
]


var threeBodyFigure8= [
    {
        // slight alterations make the pattern last longer before the limits of my simulator become apparent haha
        "name": "Body1",
            "pixelSize": 6,
            "color": "red",
            "x": -1 * scaleFactor,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0.347111,
            "dy": 0.532728,
            "dz": 0,                                                                
            "mass": 1 * scaleFactor * inverseGravConst,
            "lines":  []                                 
    },

    {
        "name": "Body2",
            "pixelSize": 6,
            "color": "green",
            "x": 1 * scaleFactor,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0.347111,
            "dy": 0.532728,
            "dz": 0,                                                                
            "mass": 1 * scaleFactor * inverseGravConst,
            "lines":  []                                 
    },

    {
        "name": "Body3",
            "pixelSize": 6,
            "color": "blue",
            "x": 0,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0.347111 * -2 ,
            "dy": 0.532728 * -2 ,
            "dz": 0,                                                                
            "mass": 1 * scaleFactor * inverseGravConst,
            "lines":  []                                 
    },
]

var threeBodyPythag = [
    {
        // slight alterations make the pattern last longer before the limits of my simulator become apparent haha
        "name": "Body1",
            "pixelSize": 3,
            "color": "red",
            "x": 0,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0,
            "dy": 0,
            "dz": 0,                                                                
            "mass": 3 * Math.pow(10, 25),
            "lines":  []                                 
    },

    {
        "name": "Body2",
            "pixelSize": 4,
            "color": "green",
            "x": 30000000000,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0,
            "dy": 0,
            "dz": 0,                                                                
            "mass": 4 * Math.pow(10, 25),
            "lines":  []                                 
    },

    {
        "name": "Body3",
            "pixelSize": 5,
            "color": "blue",
            "x": 30000000000,                                                                 
            "y": 40000000000,
            "z": 0,
            "dx": 0,
            "dy": 0,
            "dz": 0,                                                                
            "mass": 5 * Math.pow(10, 25),
            "lines":  []                                 
    },
]

var emptySolarSystem =  [
    {
        "name": "Sun",
        "pixelSize": 10,
        "diameter": 695000 * Math.pow(10, 3),
        "color": "orange",
        "x": 0,                                                                 
        "y": 0,
        "z": 0,  
        "dx": 0,
        "dy": 0,
        "dz": 0,                                                               
        "mass": 1988500 * Math.pow(10, 24),
        "lines":   []
    }
]

//not working, bodies collide and destroy themselves
var threeBodyButterfly= [
    {
        // slight alterations make the pattern last longer before the limits of my simulator become apparent haha
        "name": "Body1",
            "pixelSize": 6,
            "color": "red",
            "x": -1 * scaleFactor,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0.306893,
            "dy": 0.125507,
            "dz": 0,                                                                
            "mass": 1 * scaleFactor * inverseGravConst,
            "lines":  []                                 
    },

    {
        "name": "Body2",
            "pixelSize": 6,
            "color": "green",
            "x": 1 * scaleFactor,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0.306893,
            "dy": 0.125507,
            "dz": 0,                                                                
            "mass": 1 * scaleFactor * inverseGravConst,
            "lines":  []                                 
    },

    {
        "name": "Body3",
            "pixelSize": 6,
            "color": "blue",
            "x": 0,                                                                 
            "y": 0,
            "z": 0,
            "dx": 0.306893 * -2,
            "dy": 0.125507 * -2,
            "dz": 0,                                                                
            "mass": 1 * scaleFactor * inverseGravConst,
            "lines":  []                                 
    },
]


export var newMoth = threeBodyMoth.map(ConvertOldSolSystems)
export var newFigure8 = threeBodyFigure8.map(ConvertOldSolSystems)
export var newPythag = threeBodyPythag.map(ConvertOldSolSystems)
export var newButter = threeBodyButterfly.map(ConvertOldSolSystems)
export var newEmpty = emptySolarSystem.map(ConvertOldSolSystems)


