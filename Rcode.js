let Sta = {
    gap: 10
}

let DH = 18;

let DType = {
    normal: 1
}

let Side = {
    left: 0,
    down: 1,
    right: 2,
    up: 3
}

let LetterTest = /[A-Za-z]/;
let NotSpace = /[^\s\n\r]/;

function Rline(name) {
    var this_ = this;
    this_.name = name;
    this_.start = null;
    this_.end = [];
    this_.startPort = name;
    this_.endPort = [];
    this_.startPoint = null;
    this_.endPoint = [];
    this_.two_way = false;
}

function Device(content) {
    var this_ = this;
    this_.name = null;
    this_.type = DType.normal;
    this_.content = content;
    this_.rotation = 0;
    this_.contentSide = Side.down;
    this_.layer = 0;
    this_.points = {
        left: [],
        right: [],
        up: [],
        down: []
    }
    this_.pointsSize = {
        left: [],
        right: [],
        up: [],
        down: []
    }
    this_.x = 0;
    this_.y = 0;
}

function Point(name) {
    var this_ = this;
    this_.name = name;
    this_.x = 0;
    this_.y = 0;
}

function Line(sp, ep) {
    var this_ = this;
    this_.s = sp;
    this_.e = ep;
}

function SearchIn(RLines, InPorts) {
    let t = null
    InPorts.forEach(s => {
        RLines.forEach(element => {
            if (element.name == s)
                if (t == null || t.layer < element.start.layer)
                    t = element.start;
        })

    });
    return t;
}

function SearchName(RLines, name) {
    let t = null;
    RLines.some(e => {
        if (e.name == name) {
            t = e;
            return true;
        }
    })
    return t;
}

function LayerAdd(Layer, Device) {
    if (Layer[Device.layer] != undefined) {
        Layer[Device.layer].push(Device)
    } else {
        Layer[Device.layer] = []
        Layer[Device.layer].push(Device)
    }
}

function DiliverPart(code) {
    let Layer = {}
    let RLines = []
    let codeAll = code.join('\n').replace(/ /g, '');

    let idx = 0, idx_r = 0;
    let line = 1, line_s = 0;
    let deviceName = undefined;
    let InCaught = false;

    let DevideS = 0;

    try {
        while (idx < codeAll.length) {
            let ch = codeAll[idx];
            switch (ch) {
                case '\n':
                    line++;
                    line_s = idx + 1;
                    break;
                case '\\':
                    codeAll = codeAll.remove(idx, 1);
                    break;
                case '(':
                    if (!InCaught) {
                        deviceName = codeAll.slice(line_s, idx);
                        idx_r = idx;
                        DevideS = line;
                        InCaught = true;
                    }
                    break;
                case ')':
                    let info = codeAll.slice(idx_r + 1, idx).replace(/\n/g, '').split(';');
                    console.log(deviceName, info);
                    let D = new Device(info[0]);
                    let InPorts = info[1].replace(/ /g, '').split(',');
                    let OutPorts = info[2].replace(/ /g, '').split(',');
                    if (deviceName.indexOf(':') != -1) {
                        D.layer = Number(deviceName.split(':')[0]);
                        LayerAdd(Layer, D);
                        deviceName = deviceName.split(':')[1];
                    } else {
                        let InD = SearchIn(RLines, InPorts);
                        if (InD == null) {
                            LayerAdd(Layer, D);
                        } else {
                            D.layer = InD.layer + 1;
                            LayerAdd(Layer, D);
                        }
                    }
                    OutPorts.forEach(s => {
                        if (s != '') {
                            let tw = s.split('|');
                            let sInfo = tw.split(':');
                            let Port = SearchName(RLines, sInfo[0])
                            if (Port != null && Port.start == D) {
                                line = DevideS;
                                throw 'One device has two or more same out-port [' + sInfo[0] + ']';
                            }
                            else {
                                if (tw[1] != undefined && tw[1] == 'true')
                                    RL.two_way = true;
                                if (Port != null && Port.start != null) {
                                    RL.end.push(D);
                                    RL.endPort.push(sInfo[1] == undefined ? sInfo[0] : sInfo[1]);
                                    RLines.push(RL);
                                } else {
                                    let RL = Port == null ? new Rline(sInfo[0]) : Port;
                                    RL.start = D;
                                    RL.startPort = sInfo[1] == undefined ? sInfo[0] : sInfo[1];
                                    RLines.push(RL);
                                }
                            }
                        }
                    })
                    InPorts.forEach(s => {
                        if (s != '') {
                            let sInfo = s.split(':');
                            let Port = SearchName(RLines, sInfo[0])
                            let RL = (Port == null ? new Rline(sInfo[0]) : Port);
                            if (RL.end.indexOf(D) != -1) {
                                line = DevideS;
                                throw 'One device has two or more same in-port [' + sInfo[0] + ']';
                            }
                            RL.end.push(D);
                            RL.endPort.push(sInfo[1] == undefined ? sInfo[0] : sInfo[1]);
                            if (Port == null)
                                RLines.push(RL);
                        }
                    })
                    D.name = deviceName;
                    InCaught = false;
                    break;
                default:
            }
            idx++;

        }
    } catch (e) {
        throw {
            error: e,
            line: line
        }
    }
    let layer = Object.keys(Layer).sort((a, b) => {
        return a - b;
    })
    let FLayer = []
    layer.forEach(e => {
        FLayer.push(Layer[e]);
    })
    return { Layer: FLayer, RLines: RLines };
}

function GetTextSize(text,ts) {
    let dom = doc.createElement('span');
    dom.style.position = 'absolute';
    dom.style.fontFamily = 'consolas';
    dom.style.fontSize = ts + 'px';
    let textl = text.split('\n');
    let w = 0, h = 0;
    textl.forEach(item => {
        dom.textContent = item;
        document.body.appendChild(dom);
        w = Math.max(w, dom.clientWidth);
        h = h + dom.clientHeight;
        document.body.removeChild(dom);
    });
    return { w: w, h: h };
}

function AverageAdd(arr,sum,s,e) {
    if (s == undefined || e == undefined) {
        let average = sum / arr.length;
        arr.forEach((n, i) => {
            arr[i] = n + average;
        })
    } else {
        let average = sum / (e-s);
        for (let i = s; i < e; i++){
            arr[i] = arr[i] + average;
        }
    }
}

function GetSizePos(Layer,ts) {
    Layer.forEach(Devices=> {
        Devices.forEach(D => {
            let up = 0, down = 0, left = 0,right = 0;
            D.points.up.forEach(p => {
                let w = GetTextSize(p.name, ts).w;
                D.pointsSize.up.push(w);
                up += w;
            })
            D.points.down.forEach(p => {
                let w = GetTextSize(p.name, ts).w;
                D.pointsSize.down.push(w);
                down += w;
            })
            D.points.left.forEach(p => {
                let h = GetTextSize(p.name, ts).h;
                D.pointsSize.left.push(h);
                left += h;
            })
            D.points.right.forEach(p => {
                let h = GetTextSize(p.name, ts).h;
                D.pointsSize.right.push(h);
                right += h;
            })
            if (down > up)
                AverageAdd(D.pointsSize.up, down - up);
            else
                AverageAdd(D.pointsSize.down, up - down);
            
            if (left > right)
                AverageAdd(D.pointsSize.right, left - right);
            else
                AverageAdd(D.pointsSize.left, right - left);
        })
    })

    let Layers = Object.keys(Layer);
    for (let i = 1; i < Layers.length; i++){
        let j_D = 0,j_P = 0;
        let LastD = Layer[Layers[i - 1]][j_D];
        Layer[Layers[i]].forEach((device, index) => {
            while (LastD.end[j_P].layer > device.layer) {
                j_P++;
                if (j_P >= LastD.end.length) {
                    j_D++;
                    if (j_D >= Layer[Layers[i - 1]].length) {
                        j_D--;
                        j_P--;
                        break;
                    }
                    LastD = Layer[j_D];
                    j_P = 0;
                }
            }

        })

    }
}

function Connect(Layer, RLines) {
    let lines = [];

    RLines.forEach(rl => {
        if (rl.start == null) {
            rl.end.forEach((end, i) => {
                let ep = new Point(rl.endPort[i]);
                lines.push(new Line(null, ep));
                end.points.up.push(ep);
            })
        } else if (rl.end.length == 0) {
            let sp = new Point(rl.startPort);
            lines.push(new Line(sp, null));
            rl.start.points.down.push(sp);
        } else {
            rl.end.forEach((end, i) => {
                let sp = new Point(rl.startPort);
                let ep = new Point(rl.endPort[i]);
                lines.push(new Line(sp, ep));
                if (end.layer == rl.start.layer) {
                    let sidx = Layer[end.layer].indexOf(rl.start), eidx = Layer[end.layer].indexOf(end)
                    if (sidx == eidx + 1) {
                        rl.start.points.left.push(sp);
                        end.points.right.push(ep);
                    } else if (sidx + 1 == eidx) {
                        rl.start.points.right.push(sp);
                        end.points.left.push(ep);
                    } else {
                        rl.start.points.up.push(sp);
                        end.points.up.push(ep);
                    }
                } else {
                    if (end.layer < rl.start.layer) {
                        rl.start.points.up.push(sp);
                        end.points.down.push(ep);
                    } else {
                        rl.start.points.down.push(sp);
                        end.points.up.push(ep);
                    }
                }
            })
        }
    })
    return lines;
}

function Draw(Layer, RLines, sw, ts) {
    let Svg = [];

    let lines = Connect(Layer, RLines);
    GetSizePos(Layer,ts);
}

String.prototype.remove = function (pos, n) {
    if (n == undefined)
        return this.substring(0, pos);
    else
        return this.slice(0, pos) + this.slice(pos + n)
}