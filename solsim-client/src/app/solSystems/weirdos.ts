import { SolWebSocketDataReq } from '../models/dtos';
import { OrbitBody } from '../models/models';

var scaleFactor = 1e8
var inverseGravConst = 1 / (6.67408 * Math.pow(10, -11))

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

export var newMoth = threeBodyMoth.map(b => {
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
})