const Immutable = require('immutable');

const R90 = [[0, -1], [1, 0]];
const FLIP = [[0, 1], [1, 0]];

class Shape {
    constructor(_seq) {
        const minY = _seq.map(c => c.get('y')).reduce((a, c) => Math.min(a, c), Number.MAX_VALUE);
        const minX = _seq.map(c => c.get('x')).reduce((a, c) => Math.min(a, c), Number.MAX_VALUE);
        this.seq = _seq.map(c => {
            return Immutable.Map({x: c.get('x') - minX, y: c.get('y') - minY});
        }).sort((a, b) => {
            if (a.get('x') === b.get('x')) {
                return a.get('y') - b.get('y');
            } else {
                return a.get('x') - b.get('x');
            }
        });
    }

    rotate90() {
        return new Shape(Shape.applyMatrix(this.seq, R90));
    }

    flip() {
        return new Shape(Shape.applyMatrix(this.seq, FLIP));
    }

    static applyMatrix(seq, mx) {
        return seq.map(c => {
            const x = c.get('x') * mx[0][0] + c.get('y') * mx[0][1];
            const y = c.get('x') * mx[1][0] + c.get('y') * mx[1][1];
            return Immutable.Map({x, y});
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

        patterns = patterns.concat(...this.flip().get4Rotations());
        patterns = patterns.sort((p, q) => {
            if (p.seq.size !== q.seq.size) {
                return p.seq.size - q.seq.size;
            } else {
                for (let i = 0; i < p.seq.size; i++) {
                    if (p.seq.get(i).get('x') !== q.seq.get(i).get('x')) {
                        return p.seq.get(i).get('x') - q.seq.get(i).get('x');
                    } else if (p.seq.get(i).get('y') !== q.seq.get(i).get('y')) {
                        return p.seq.get(i).get('y') - q.seq.get(i).get('y');
                    }
                }
            }
            return 0;
        });
        return patterns.get(0);
    }

    toString() {
        const maxY = this.seq.map(c => c.get('y')).reduce((a, c) => Math.max(a, c), 0);
        const maxX = this.seq.map(c => c.get('x')).reduce((a, c) => Math.max(a, c), 0);
        const draw = new Array(maxY + 1);
        for (let i = 0; i < maxY + 1; i++) {
            draw[i] = new Array(maxX + 1);
        }

        this.seq.forEach(co => {
            draw[co.get('y')][co.get('x')] = true;
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

    const canonical = new Shape(seq).getCanonical();
    seq = canonical.seq;
    if (shapes.includes(seq)) {
        return shapes;
    }
    shapes = shapes.add(seq);

    seq.forEach(co => {
        for (let i = 0; i < 4; i++) {
            const nco = Immutable.Map({x: co.get('x') + DX[i], y: co.get('y') + DY[i]});
            if (seq.includes(nco)) {
                continue;
            }
            shapes = recursiveGenerator(seq.push(nco), shapes, max);
        }
    });
    return shapes;
};

const generateAllShapes = (maxSize) => {
    const origin = Immutable.Map({x: 0, y: 0});
    let seq = Immutable.List().push(origin);
    let shapes = Immutable.Set();
    shapes = recursiveGenerator(seq, shapes, maxSize);
    return shapes.toList()
        .sort((a, b) => a.size - b.size)
        .map(seq => new Shape(seq));
};

generateAllShapes(5);