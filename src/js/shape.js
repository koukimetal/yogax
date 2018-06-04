const Immutable = require('immutable');

const R90 = [[0, -1], [1, 0]];
const FLIP = [[0, 1], [1, 0]];

const Coordinate = Immutable.Record({x: 0, y: 0}, 'Coordinate');

class Shape extends Immutable.Record({seq: Immutable.List()}, 'Shape') {
    static getShape(seq) {
        const minY = seq.map(c => c.y).reduce((a, c) => Math.min(a, c), Number.MAX_VALUE);
        const minX = seq.map(c => c.x).reduce((a, c) => Math.min(a, c), Number.MAX_VALUE);
        seq= seq.map(c => {
            return new Coordinate({x: c.x - minX,  y: c.y - minY});
        }).sort((a, b) => {
            if (a.x === b.x) {
                return a.y - b.y;
            } else {
                return a.x - b.x;
            }
        });
        return new Shape({seq});
    }

    rotate90() {
        return Shape.getShape(Shape.applyMatrix(this.seq, R90));
    }

    flip() {
        return Shape.getShape(Shape.applyMatrix(this.seq, FLIP));
    }

    static applyMatrix(seq, mx) {
        return seq.map(c => {
            const x = c.x * mx[0][0] + c.y * mx[0][1];
            const y = c.x * mx[1][0] + c.y * mx[1][1];
            return new Coordinate({x, y});
        })
    }

    get4Rotations() {
        let rs = Immutable.List().push(this);
        rs = rs.push(rs.get(0).rotate90());
        rs = rs.push(rs.get(1).rotate90());
        rs = rs.push(rs.get(2).rotate90());
        return rs;
    }

    getCanonical() {
        let patterns = this.get4Rotations();

        patterns = patterns.concat(this.flip().get4Rotations());
        patterns = patterns.sort((p, q) => {
            if (p.seq.size !== q.seq.size) {
                return p.seq.size - q.seq.size;
            } else {
                for (let i = 0; i < p.seq.size; i++) {
                    if (p.seq.get(i).x !== q.seq.get(i).x) {
                        return p.seq.get(i).x - q.seq.get(i).x;
                    } else if (p.seq.get(i).y !== q.seq.get(i).y) {
                        return p.seq.get(i).y - q.seq.get(i).y;
                    }
                }
            }
            return 0;
        });
        return patterns.get(0);
    }

    draw() {
        const maxY = this.seq.map(c => c.y).reduce((a, c) => Math.max(a, c), 0);
        const maxX = this.seq.map(c => c.x).reduce((a, c) => Math.max(a, c), 0);
        const draw = new Array(maxY + 1);
        for (let i = 0; i < maxY + 1; i++) {
            draw[i] = new Array(maxX + 1);
        }

        this.seq.forEach(co => {
            draw[co.y][co.x] = true;
        });

        for (let i = 0; i < maxY + 1; i++) {
            let line = '';
            for (let j = 0; j < maxX + 1; j++) {
                if (draw[i][j]) {
                    line += 'X';
                } else {
                    line += '.';
                }
            }
            console.log(line);
        }
    }
}

const DX = [0, 0, 1, -1];
const DY = [1, -1, 0, 0];

const recursiveGenerator = (seq, shapes, max) => {
    if (seq.size > max) {
        return shapes;
    }

    const canonical = Shape.getShape(seq).getCanonical();
    if (shapes.includes(canonical)) {
        return shapes;
    }
    shapes = shapes.add(canonical);

    seq.forEach(co => {
        for (let i = 0; i < 4; i++) {
            const nco = Coordinate({x: co.x + DX[i], y: co.y + DY[i]});
            if (seq.includes(nco)) {
                continue;
            }
            shapes = recursiveGenerator(seq.push(nco), shapes, max);
        }
    });
    return shapes;
};

const generateAllShapes = (maxSize) => {
    const origin = new Coordinate({x: 0, y: 0});
    let seq = Immutable.List().push(origin);
    let shapes = Immutable.Set();
    shapes = recursiveGenerator(seq, shapes, maxSize);
    return shapes.toList();
};

const debug = () => {
    const result = generateAllShapes(5);
    console.log(result.size);
    result.sort((a, b) => a.seq.size - b.seq.size)
    .forEach(seq => {
        console.log();
        seq.draw();
    });
};

debug();