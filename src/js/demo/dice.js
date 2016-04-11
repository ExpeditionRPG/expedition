"use strict";

var copyto = function(obj, res) {
    if (obj == null || typeof obj !== 'object') return obj;
    if (obj instanceof Array) {
        for (var i = obj.length - 1; i >= 0; --i)
            res[i] = copy(obj[i]);
    }
    else {
        for (var i in obj) {
            if (obj.hasOwnProperty(i))
                res[i] = copy(obj[i]);
        }
    }
    return res;
}

var copy = function(obj) {
    if (!obj) return obj;
    return copyto(obj, new obj.constructor());
}

var DiceMaker = function(scale) {

    this.scale = 50;
    this.chamfer = 0.6;
    this.material_options = {
        specular: '#171d1f',
        color: '#aaaaaa',
        emissive: '#000000',
        shininess: 70,
        shading: THREE.FlatShading,
    };
    this.label_color = '#aaaaaa';
    this.dice_color = '#860910';
    this.known_types = [ 'd20' ];


    function create_shape(vertices, faces, radius) {
        var cv = [], cf = [];
        for (var i = 0; i < vertices.length; ++i) {
            var v = vertices[i];
            var l = radius / Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            cv.push(new CANNON.Vec3(v[0] * l, v[1] * l, v[2] * l));
        }
        for (var i = 0; i < faces.length; ++i) {
            var f = faces[i];
            cf.push(faces[i].slice(0, faces[i].length - 1));
        }
        return new CANNON.ConvexPolyhedron(cv, cf);
    }

    function make_geom(vertices, faces, radius, tab, af) {
        var geom = new THREE.Geometry();
        for (var i = 0; i < vertices.length; ++i) {
            var vertex = (new THREE.Vector3).fromArray(vertices[i]).normalize().multiplyScalar(radius);
            vertex.index = geom.vertices.push(vertex) - 1;
        }
        for (var i = 0; i < faces.length; ++i) {
            var ii = faces[i], fl = ii.length - 1;
            var aa = Math.PI * 2 / fl;
            for (var j = 0; j < fl - 2; ++j) {
                geom.faces.push(new THREE.Face3(ii[0], ii[j + 1], ii[j + 2], [geom.vertices[ii[0]],
                            geom.vertices[ii[j + 1]], geom.vertices[ii[j + 2]]], 0, ii[fl] + 1));
                geom.faceVertexUvs[0].push([
                        new THREE.Vector2((Math.cos(af) + 1 + tab) / 2 / (1 + tab),
                            (Math.sin(af) + 1 + tab) / 2 / (1 + tab)),
                        new THREE.Vector2((Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab),
                            (Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab)),
                        new THREE.Vector2((Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab),
                            (Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab))]);
            }
        }
        geom.computeFaceNormals();
        geom.computeVertexNormals();
        geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
        return geom;
    }

    function create_geom(vertices, faces, radius, tab, af) {
        var geom = make_geom(vertices, faces, radius, tab, af);
        geom.cannon_shape = create_shape(vertices, faces, radius);
        return geom;
    }

    this.standard_d20_dice_face_labels = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

    this.create_dice_materials = function(face_labels, size, margin) {
        function create_text_texture(text, color, back_color) {
            if (text == undefined) return null;
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = size + margin;
            canvas.height = size + margin;
            context.font = size + "pt Arial";
            context.fillStyle = back_color;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = color;
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            if (text == '6' || text == '9') {
                context.fillText('  .', canvas.width / 2, canvas.height / 2);
            }
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        }
        var materials = [];
        for (var i = 0; i < face_labels.length; ++i)
            materials.push(new THREE.MeshPhongMaterial(copyto(this.material_options,
                        { map: create_text_texture(face_labels[i], this.label_color, this.dice_color) })));
        return materials;
    }

    this.create_d20_geometry = function(radius) {
        var t = (1 + Math.sqrt(5)) / 2;
        var vertices = [[-1, t, 0], [1, t, 0 ], [-1, -t, 0], [1, -t, 0],
                [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
                [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
        var faces = [[0, 11, 5, 1], [0, 5, 1, 2], [0, 1, 7, 3], [0, 7, 10, 4], [0, 10, 11, 5],
                [1, 5, 9, 6], [5, 11, 4, 7], [11, 10, 2, 8], [10, 7, 6, 9], [7, 1, 8, 10],
                [3, 9, 4, 11], [3, 4, 2, 12], [3, 2, 6, 13], [3, 6, 8, 14], [3, 8, 9, 15],
                [4, 9, 5, 16], [2, 4, 11, 17], [6, 2, 10, 18], [8, 6, 7, 19], [9, 8, 1, 20]];
        return create_geom(vertices, faces, radius, -0.2, -Math.PI / 4 / 2);
    }

    this.create_d20 = function(scale) {
        this.scale = scale;
        if (!this.d20_geometry) this.d20_geometry = this.create_d20_geometry(this.scale);
        if (!this.dice_material) this.dice_material = new THREE.MeshFaceMaterial(
                this.create_dice_materials(this.standard_d20_dice_face_labels, this.scale / 2, this.scale));
        return new THREE.Mesh(this.d20_geometry, this.dice_material);
    }

};

var dicemaker = new DiceMaker();