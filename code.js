// JavaScript Document
/* eslint-env es6 */
/* eslint-disable no-console */
let LetterTest = /[A-Za-z]/;
let NotSpace = /[^\s\n\r]/

let lstatic = {
    ten: 20,
    dten: 20,
    ften: 40,
    tten: 30,
    relaxl: 20
}

const direction = {
    left_: -1,
    right_: 1,
    up_: -2,
    down_: 2
}

const NodeType = {
    func: 0,
    condition: 1,
    action: 2,
    input: 3,
    none: 5,
    jump: 6,
    head: 7,
    final: 8,
    whileCond: 9,
    ElseIfCond: 10,
    turn: 11
}

function Size(dw, dh) {
    if (arguments.length == 1) {
        this.width = dw.width;
        this.height = dw.height;
    } else {
        this.width = dw;
        this.height = dh;
    }
}

function Point(dx, dy) {
    if (arguments.length == 1) {
        this.x = dx.x;
        this.y = dx.y;
    } else {
        this.x = dx;
        this.y = dy;
    }

}

function CmpPoint(p1, p2) {
    if (p1.x == p2.x && p1.y == p2.y)
        return true;
    else
        return false;
}

function Rect(dx, dy, dw, dh) {
    if (arguments.length == 2) {
        this.x = dx.x;
        this.y = dx.y;
        this.w = dy.width;
        this.h = dy.height;
    } else {
        this.x = dx;
        this.y = dy;
        this.w = dw;
        this.h = dh;
    }
}

function Line(p1, p2, parm1, parm2) {
    if (arguments.length == 2) {
        this.p1 = p1;
        this.p2 = p2;
    } else {
        this.p1 = new Point(p1, p2);
        this.p2 = new Point(parm1, parm2);
    }
}

var fh;
var ts;

function getStringSize(str, doc, Type) {
    var dom = doc.createElement('span');
    dom.style.position = 'absolute';
    dom.style.fontFamily = 'consolas';
    dom.style.fontSize = ts + 'px';
    var textl = str.split('\n');
    var w = 0, h = 0;
    textl.forEach(item => {
        dom.textContent = item;
        doc.body.appendChild(dom);
        w = Math.max(w, dom.clientWidth);
        if (fh == undefined)
            fh = dom.clientHeight;
        h = h + dom.clientHeight;
        doc.body.removeChild(dom);
    });
    if (Type == NodeType.condition) {
        w = w + 5 + (w / 2 + 5) * (h / 2 + 5) / (lstatic.dten / 4);
        h += 3 / 2 * lstatic.dten;
    } else if (Type == NodeType.input) {
        w += lstatic.dten * 2;
        h += lstatic.dten;
    } else if (Type != NodeType.none) {
        w += lstatic.dten;
        h += lstatic.dten;
    }
    return new Size(w, h);
}

String.prototype.insert = function (start, newStr) {
    return this.slice(0, start) + newStr + this.slice(start);
};

String.prototype.remove = function (pos, n) {
    if (n == undefined)
        return this.substring(0, pos);
    else
        return this.slice(0, pos) + this.slice(pos + n)
}
function CreateString(ch, n) {
    let t = '';
    while (n > 0) {
        t += ch;
        n--;
    }
    return t;
}

Array.prototype.insert = function (i, o) {
    let left = this.slice(0, i);
    let right = this.slice(i);
    return left.concat([o], right);
};

Array.prototype.erase = function (i) {
    return this.slice(0, i).concat(this.slice(i + 1));
}

function AutoWrap(text, maxl) {
    var index = 0, count = 0;
    while (index < text.length) {
        let uni = text.charCodeAt(index);
        if (uni > 256)
            count += 2;
        else if (text.charAt(index) == '\n')
            count = 0;
        else
            count++;
        if (count > maxl) {
            if (text.charAt(index + 1) != '\n')
                text = text.insert(index, '\n');
            count = 0;
        }
        index++;
    }
    text = text.replace(/</, '&lt;')
    text = text.replace(/>/, '&gt;')
    return text;
}

function GetWay(l) {
    if (l.p1.x == l.p2.x) {
        if (l.p1.y > l.p2.y)
            return direction.up_;
        else
            return direction.down_;
    } else {
        if (l.p1.x > l.p2.x)
            return direction.left_;
        else
            return direction.right_;
    }
}

function IfHit(l, rects) {
    var x1, x2, y1, y2;
    let rect = {
        r: undefined,
        t: 0
    }
    rects.some(r => {
        var p1 = l.p1, p2 = l.p2;
        x1 = r.x, y1 = r.y, x2 = r.x + r.w, y2 = r.y + r.h;
        if (p2.x >= x1 && p2.x <= x2 && p2.y >= y1 && p2.y <= y2) {
            rect.r = r;
            rect.t = 1;
            return true;
        }
        else if (p1.x == p2.x) {
            if (p1.x >= x1 && p1.x <= x2 && ((p1.y <= y1 && p2.y >= y2) || (p2.y <= y1 && p1.y >= y2))) {
                rect.r = r;
                rect.t = 2;
                return true;
            }
        } else if (p1.y == p2.y) {
            if (p1.y >= y1 && p1.y <= y2 && ((p1.x <= x1 && p2.x >= x2) || (p2.x <= x1 && p1.x >= x2))) {
                rect.r = r;
                rect.t = 3;
                return true;
            }
        }
    })
    return rect;
}

var statistic = {
    MaxLength: 25,
    PaddingH: 2 * lstatic.ten,
    PaddingW: 2 * lstatic.ten
}

function GetJumpCount(node) {
    if (node instanceof ConditionNode) {
        node.JumpCount = 0;
        if (node.NextNode != undefined && node.Type != NodeType.jump)
            node.JumpCount += GetJumpCount(node.NextNode);
        else
            node.JumpCount += node.Type == NodeType.jump;
        if (node.TrueNode != undefined)
            node.JumpCount += GetJumpCount(node.TrueNode);
        if (node.FalseNode != undefined)
            node.JumpCount += GetJumpCount(node.FalseNode);
        return node.JumpCount;
    } else {
        if (node.NextNode != undefined && node.Type != NodeType.jump) {
            node.JumpCount = GetJumpCount(node.NextNode);
        } else {
            node.JumpCount = (node.Type == NodeType.jump);
        }
        return node.JumpCount;
    }
}

let sizes;

function GetSize2(node, doc) {
    if (node.size == undefined) {
        let np = node.nextPadding == undefined ? statistic.PaddingH : node.nextPadding,
            sp = node.sidePadding == undefined ? statistic.PaddingW : node.sidePadding;
        node.size = new Size(0, 0);
        node.OwnSize = new Size(0, 0);
        if (node.Type == NodeType.turn) {
            GetSize2(node.NextNode, doc)
            node.turnPos = sizes.length
            sizes.push({ width: node.NextNode.size.width, height: node.NextNode.size.height, padding: Number(node.Content) });
            node.offsetx = 0.5;
            return;
        } else if (node.Type == NodeType.head || node.Type == NodeType.final) {
            getStringSize('start', doc, NodeType.action);
            node.OwnSize = new Size(lstatic.ften * 3, lstatic.ften);
        } else if (node.Type == NodeType.input || node.Type == NodeType.action || node.Type == NodeType.condition) {
            node.Content = AutoWrap(node.Content, statistic.MaxLength);
            node.OwnSize = getStringSize(node.Content, doc, node.Type);
        } else if (node.Type == NodeType.jump) {
            node.offsetx = 0.5;
            node.turnPos = sizes.length
            return;
        }

        if (node instanceof ConditionNode) {
            let cp = node.condPadding == undefined ? statistic.PaddingH : node.condPadding;
            let tp = node.sideType || 0;
            let cs = node.changeSide || false;
            let nlw = 0, nrw = 0, tlw = 0, trw = 0, flw = 0, frw = 0, th = 0, fh = 0, nh = 0;
            if (node.NextNode != undefined) {
                GetSize2(node.NextNode, doc);
                nlw = node.NextNode.size.width * node.NextNode.offsetx;
                nrw = node.NextNode.size.width - nlw;
                nh = node.NextNode.size.height;
            }
            if (node.FalseNode != undefined) {
                GetSize2(node.FalseNode, doc);
                flw = node.FalseNode.size.width * node.FalseNode.offsetx;
                frw = node.FalseNode.size.width - flw;
                fh = node.FalseNode.size.height;
            }
            GetSize2(node.TrueNode, doc);
            tlw = node.TrueNode.size.width * node.TrueNode.offsetx;
            trw = node.TrueNode.size.width - tlw;
            th = node.TrueNode.size.height;
            let lt = [], rt = [];
            if (cs) {
                if (tp == 0) {
                    lt.push(tlw + sp + node.OwnSize.width / 2);
                    lt.push(nlw + flw + sp)
                    lt.push(tlw + trw + flw + sp);
                } else if (tp == 1) {
                    lt.push(tlw + sp + node.OwnSize.width / 2);
                    lt.push(tlw + trw + sp)
                    lt.push(nlw + tlw + sp);
                } else {
                    lt.push(node.OwnSize.width / 2);
                    lt.push(tlw);
                    lt.push(nlw);
                }
            } else {
                if (tp == 0) {
                    lt.push(flw + sp + node.OwnSize.width / 2);
                    lt.push(nlw + tlw + sp)
                    lt.push(flw + frw + tlw + sp);
                } else if (tp == 1) {
                    lt.push(flw + sp + node.OwnSize.width / 2);
                    lt.push(flw + frw + sp)
                    lt.push(nlw + flw + sp);
                } else {
                    lt.push(node.OwnSize.width / 2);
                    lt.push(flw);
                    lt.push(nlw);
                }
            }
            lt = Math.max(...lt);
            if (cs) {
                if (tp == 0) {
                    rt.push(node.OwnSize.width / 2);
                    rt.push(frw);
                    rt.push(nrw);
                } else if (tp == 1) {
                    rt.push(frw + sp + node.OwnSize.width / 2);
                    rt.push(flw + frw + sp)
                    rt.push(nrw);
                } else {
                    rt.push(frw + sp + node.OwnSize.width / 2);
                    rt.push(nrw + trw + sp)
                    rt.push(flw + frw + trw + sp);
                }
            } else {
                if (tp == 0) {
                    rt.push(node.OwnSize.width / 2);
                    rt.push(trw);
                    rt.push(nrw);
                } else if (tp == 1) {
                    rt.push(trw + sp + node.OwnSize.width / 2);
                    rt.push(tlw + trw + frw + sp)
                    rt.push(nrw + frw + sp);
                } else {
                    rt.push(trw + sp + node.OwnSize.width / 2);
                    rt.push(tlw + trw + sp)
                    rt.push(nrw + frw + sp);
                }
            }
            rt = Math.max(...rt);
            node.size = new Size(lt + rt, node.OwnSize.height + cp + Math.max(th, fh) + (nh == 0 ? 0 : nh + np));
            node.offsetx = lt / (lt + rt);
        } else {
            if (node.NextNode != undefined) {
                GetSize2(node.NextNode, doc);
                let offsetx = node.NextNode.offsetx;
                let lw = node.NextNode.size.width * offsetx;
                let rw = node.NextNode.size.width - lw;
                let nh = node.NextNode.size.height;
                lw = node.OwnSize.width * offsetx > lw ? node.OwnSize.width * offsetx : lw;
                rw = node.OwnSize.width * (1 - offsetx) > rw ? node.OwnSize.width * (1 - offsetx) : rw;
                node.offsetx = lw / (lw + rw);
                let t = 0;
                if (node.NextNode.type == NodeType.jump)
                    t = lstatic.ten;
                else if (node.type != NodeType.func)
                    t = np;
                node.size = new Size(lw + rw, nh + node.OwnSize.height + t);
            } else {
                node.size = new Size(node.OwnSize);
                node.offsetx = 0.5;
            }
        }
        node.turnPos = sizes.length
    }

}

function CalSx(tpos) {
    let x = 0;
    tpos = (tpos == undefined) ? sizes.length - 1 : tpos;
    for (let i = tpos; i < sizes.length; i++) {
        x += sizes[i].width + (sizes[i - 1]?.padding || 0);
    }
    return x
}

function CalculPos2(node, rects, sx, sy) {
    if (node.Type == NodeType.turn) {
        node.parent.NextNode = node.NextNode;
        node.NextNode.parent = node.parent;
        CalculPos2(node.NextNode, rects, CalSx(node.turnPos + 1), 0);
        return;
    }
    let np = node.nextPadding == undefined ? statistic.PaddingH : node.nextPadding,
        cp = node.condPadding == undefined ? statistic.PaddingH : node.condPadding;
    if (node instanceof ConditionNode) {
        let mx = sx + node.size.width * node.offsetx;
        let cs = node.changeSide || false;
        let tp = node.sideType || 0;
        node.pos = new Point(mx - node.OwnSize.width / 2, sy);
        rects.push(new Rect(node.pos, node.OwnSize));
        let th = node.TrueNode.size.height, fh = node.FalseNode == undefined ? 0 : node.FalseNode.size.height;
        if (node.NextNode != undefined)
            CalculPos2(node.NextNode, rects, mx - node.NextNode.size.width * node.NextNode.offsetx,
                sy + node.OwnSize.height + np + cp + Math.max(th, fh));

        if ((cs & tp == 2) || (!cs & tp == 0)) {
            CalculPos2(node.TrueNode, rects, mx - node.TrueNode.size.width * node.TrueNode.offsetx,
                sy + node.OwnSize.height + cp);
        } else if (!cs && tp != 0) {
            CalculPos2(node.TrueNode, rects, mx + node.size.width * (1 - node.offsetx) - node.TrueNode.size.width,
                sy + (node.TrueNode.Type == NodeType.jump ? node.OwnSize.height / 2 : node.OwnSize.height + cp));
        } else {
            CalculPos2(node.TrueNode, rects, sx,
                sy + (node.TrueNode.Type == NodeType.jump ? node.OwnSize.height / 2 : node.OwnSize.height + cp));
        }


        if (node.FalseNode != undefined) {
            if ((cs & tp == 0) || (!cs & tp == 2)) {
                CalculPos2(node.FalseNode, rects, mx - node.FalseNode.size.width * node.FalseNode.offsetx,
                    sy + node.OwnSize.height + cp);
            } else if (cs && tp != 0) {
                CalculPos2(node.FalseNode, rects, mx + node.size.width * (1 - node.offsetx) - node.FalseNode.size.width,
                    sy + (node.FalseNode.Type == NodeType.jump ? node.OwnSize.height / 2 : node.OwnSize.height + cp));
            } else {
                CalculPos2(node.FalseNode, rects, sx,
                    sy + (node.FalseNode.Type == NodeType.jump ? node.OwnSize.height / 2 : node.OwnSize.height + cp));
            }
        }
    } else {
        if (node.Type == NodeType.jump) {
            node.pos = new Point(sx, sy);
        } else {
            let mx = sx + node.size.width * node.offsetx;
            node.pos = new Point(mx - node.OwnSize.width / 2, sy);
            rects.push(new Rect(node.pos, node.OwnSize));
            if (node.NextNode != undefined)
                CalculPos2(node.NextNode, rects, mx - node.NextNode.size.width * node.NextNode.offsetx,
                    sy + node.OwnSize.height + (node.Type == NodeType.func ? 0 : np));

        }
    }
}
/*
function GetSize(node, doc) {
    if (node.size != undefined) {
        return node.size;
    } else {
        node.size = new Size(0, 0);
        node.OwnSize = new Size(0, 0);
        if (node instanceof ChartNode) {
            if (node.Type == NodeType.head || node.Type == NodeType.final) {
                node.OwnSize.height = lstatic.ften;
                node.OwnSize.width = 3 * lstatic.ften;
                if (node.NextNode != undefined && node.NextNode.Type != NodeType.jump) {
                    node.size.width = Math.max(3 * lstatic.ften, GetSize(node.NextNode, doc).width);
                    node.size.height = lstatic.ften + GetSize(node.NextNode, doc).height + statistic.PaddingH;
                } else {
                    node.size.height = lstatic.ften;
                    node.size.width = 3 * lstatic.ften;
                }
            } else if (node.Type == NodeType.input) {
                node.Content = AutoWrap(node.Content, statistic.MaxLength);
                node.size = getStringSize(node.Content, doc, node.Type);
                node.OwnSize = new Size(node.size);
                if (node.NextNode != undefined && node.NextNode.Type != NodeType.jump) {
                    node.size.width = Math.max(node.OwnSize.width, GetSize(node.NextNode, doc).width);
                    node.size.height = node.OwnSize.height + GetSize(node.NextNode, doc).height + statistic.PaddingH;
                }
            }
            else {
                node.OwnSize.height = 0;
                node.OwnSize.width = 0;
                node.size.height = 0;
                node.size.width = 0;
                if (node.Type != NodeType.jump && node.NextNode != undefined) {
                    node.size.width = GetSize(node.NextNode, doc).width;
                    node.size.height = GetSize(node.NextNode, doc).height;
                }
            }
            return node.size;
        } else if (node instanceof ActionNode) {
            node.Content = AutoWrap(node.Content, statistic.MaxLength);
            node.size = getStringSize(node.Content, doc, node.Type);
            node.OwnSize = new Size(node.size);
            if (node.NextNode != undefined) {
                node.size.width = Math.max(node.OwnSize.width, GetSize(node.NextNode, doc).width);
                node.size.height = node.OwnSize.height + GetSize(node.NextNode, doc).height + statistic.PaddingH;
            }
            return node.size;
        } else if (node instanceof ConditionNode) {
            node.Content = AutoWrap(node.Content, statistic.MaxLength);
            node.size = getStringSize(node.Content, doc, node.Type);
            node.OwnSize = new Size(node.size);
            var tw = node.TrueNode == undefined ? 0 : GetSize(node.TrueNode, doc).width;
            var th = node.TrueNode == undefined ? 0 : GetSize(node.TrueNode, doc).height;
            var fw = node.FalseNode == undefined ? 0 : GetSize(node.FalseNode, doc).width;
            var fh = node.FalseNode == undefined ? 0 : GetSize(node.FalseNode, doc).height;
            if (node.NextNode != undefined && node.NextNode.Type != NodeType.jump) {
                let t = [];
                t.push(node.OwnSize.width + 2 * statistic.PaddingW);
                t.push(GetSize(node.NextNode, doc).width + 2 * statistic.PaddingW);
                t.push(tw + 2 * statistic.PaddingW);
                if (node.FalseNode != undefined) {
                    t.push((fw + tw / 2 + statistic.PaddingW) * 2);
                    t.push(fw + node.OwnSize.width + lstatic.dten);
                }
                node.size.width = (Math.max(...t));
                node.size.height = node.OwnSize.height + GetSize(node.NextNode, doc).height + Math.max(th, fh) + 2 * statistic.PaddingH;
            } else {
                let t = new Array;
                t.push(node.OwnSize.width + 2 * statistic.PaddingW);
                t.push(tw + 2 * statistic.PaddingW);
                if (node.FalseNode != undefined) {
                    t.push((fw + tw / 2 + statistic.PaddingW) * 2);
                    t.push(fw + node.OwnSize.width + lstatic.dten);
                }
                node.size.width = Math.max(...t);
                node.size.height = (node.OwnSize.height + Math.max(th, fh) + statistic.PaddingH);
            }
            return node.size;
        } else if (node instanceof FunctionNode) {
            if (node.NextNode != undefined && node.Type != NodeType.jump) {
                node.size.width = GetSize(node.NextNode, doc).width;
                node.size.height = GetSize(node.NextNode, doc).height;
            } else {
                node.size.width = 0;
                node.size.height = 0;
            }
            node.OwnSize = new Size(0, 0);
            return node.size;
        }
    }
}

function CalculPos(node, rects, sx, sy) {
    if (arguments.length == 2) {
        node.pos.x = node.size.width / 2 - 1.5 * lstatic.ften;
        node.pos.y = 0;
        rects.push(new Rect(node.pos.x, node.pos.y, node.OwnSize.width, node.OwnSize.height));
        if (node.NextNode != undefined)
            CalculPos(node.NextNode, rects, node.size.width / 2, lstatic.ften + statistic.PaddingH);
    } else {
        if (node instanceof ChartNode || node instanceof ActionNode || node instanceof FunctionNode) {
            node.pos.x = (sx - node.OwnSize.width / 2);
            node.pos.y = (sy);
            if (node.Type != NodeType.jump && node.NextNode != undefined) {
                if (node.Type == NodeType.none || node.Type == NodeType.func)
                    CalculPos(node.NextNode, rects, sx, sy);
                else {
                    if (node.NextNode.Type == NodeType.jump)
                        CalculPos(node.NextNode, rects, sx, sy + node.OwnSize.height);
                    else
                        CalculPos(node.NextNode, rects, sx, sy + node.OwnSize.height + statistic.PaddingH);
                }
            }
            if (!(node.Type == NodeType.jump || node.Type == NodeType.none || node.Type == NodeType.func))
                rects.push(new Rect(node.pos.x, node.pos.y, node.OwnSize.width, node.OwnSize.height));
        } else if (node instanceof ConditionNode) {
            node.pos.y = sy;
            if (node.FalseNode != undefined) {
                node.pos.x = sx - node.OwnSize.width / 2;
                if (node.FalseNode.Type == NodeType.jump) {
                    CalculPos(node.FalseNode, rects, sx - node.size.width / 2 + node.FalseNode.size.width / 2, sy + node.OwnSize.height / 2);
                } else
                    CalculPos(node.FalseNode, rects, sx - node.size.width / 2 + node.FalseNode.size.width / 2, sy + node.OwnSize.height + statistic.PaddingH);
                if (node.NextNode != undefined)
                    CalculPos(node.NextNode, rects, sx, sy + node.OwnSize.height + Math.max(node.TrueNode.size.height, node.FalseNode.size.height) + 2 * statistic.PaddingH, rects);
            } else {
                node.pos.x = sx - node.OwnSize.width / 2;
                if (node.NextNode != undefined)
                    CalculPos(node.NextNode, rects, sx, sy + node.OwnSize.height + node.TrueNode.size.height + 2 * statistic.PaddingH, rects);
            }
            if (node.TrueNode.Type == NodeType.jump)
                CalculPos(node.TrueNode, rects, sx, sy + node.OwnSize.height);
            else
                CalculPos(node.TrueNode, rects, sx, sy + node.OwnSize.height + statistic.PaddingH);
            rects.push(new Rect(node.pos.x, node.pos.y, node.OwnSize.width, node.OwnSize.height));
        }
    }
}
*/

function ChartNode(type) {
    var this_ = this;
    this_.Content = '';
    this_.end = false;
    this_.FuncEnd = false;
    this_.OutContent = '';
    this_.JumpCount = 0;
    this_.OwnSize = undefined;
    this_.pos = new Point();
    this_.size = undefined;
    this_.Type = type;
    this_.NextNode = undefined;
}

ChartNode.prototype.clone = function () {
    let t = new ChartNode(this.Type);
    t.Content = this.Content;
    t.end = this.end;
    t.FuncEnd = this.FuncEnd;
    t.OutContent = this.OutContent;
    t.JumpCount = this.Type == NodeType.jump ? 0 : this.JumpCount;
    t.OwnSize = new Size(this.OwnSize);
    t.pos = new Point(this.pos);
    t.size = new Size(this.size);
    t.NextNode = this.NextNode;
    t.turnPos = this.turnPos;
    t.whileback = this.whileback;
    t.offsetx = this.offsetx;
    t.jumpSide = this.jumpSide;
    t.jumpPadding = this.jumpPadding;
    t.downPadding = this.downPadding;
    return t;
}

function ActionNode() {
    ChartNode.call(this, NodeType.action);
}

function ConditionNode() {
    var this_ = this;
    ChartNode.call(this, NodeType.condition);
    this_.TrueNode = undefined;
    this_.FalseNode = undefined;
    this_.falseSide = direction.left_;
}

function FunctionNode() {
    var this_ = this;
    ChartNode.call(this, NodeType.func);
    this_.FunctionName = '';

}

function LineV(s, e, isJump = false, Cond = false, toNext = false) {
    var this_ = this;
    this_.start = undefined;
    this_.end = undefined;
    this_.line = new Array();
    this_.finalWay = undefined;
    this_.endPoint = undefined;
    this_.startPoint = undefined;
    var init = function () {
        this_.start = s;
        this_.end = e;
        var nodes = new Array;
        var xway = Math.trunc(e.pos.x - s.pos.x + e.OwnSize.width / 2 - s.OwnSize.width / 2);
        let dp, sp;
        dp = s.downPadding == undefined ? lstatic.ten : s.downPadding, sp = s.sidePadding == undefined ? lstatic.ten : s.sidePadding;
        if (isJump) {
            let js, jp;
            if (s.whileback) {
                js = e.jumpSide || (xway <= 0 ? direction.left_ : direction.right_);
                jp = e.jumpPadding || 0
                dp = e.backPadding == undefined ? lstatic.ten : e.backPadding;
            } else {
                js = s.jumpSide || (xway <= 0 ? direction.left_ : direction.right_);
                jp = s.jumpPadding || 0
            }
            var yway = Math.trunc(e.pos.y - lstatic.ten) - (s.pos.y + e.OwnSize.height + lstatic.ten);
            if (xway == 0) {
                if (js == direction.left_) {
                    nodes.push(new Point(s.pos.x, s.pos.y));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 - e.size.width * e.offsetx - lstatic.ten - jp, s.pos.y));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 - e.size.width * e.offsetx - lstatic.ten - jp, e.pos.y - dp));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                    this_.finalWay = direction.right_;
                } else {
                    nodes.push(new Point(s.pos.x, s.pos.y));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 + e.size.width * (1 - e.offsetx) + lstatic.ten + jp, s.pos.y));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 + e.size.width * (1 - e.offsetx) + lstatic.ten + jp, e.pos.y - dp));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                    this_.finalWay = direction.left_;
                }
            }
            else if (xway < 0) {
                if (yway <= 0) {
                    if (js == direction.left_) {
                        if (yway == 0) {
                            nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width + lstatic.ten, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width + lstatic.ten, e.pos.y - lstatic.ten));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                            this_.finalWay = direction.left_;
                        } else {
                            nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 - e.size.width * e.offsetx - lstatic.ten - jp, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 - e.size.width * e.offsetx - lstatic.ten - jp, e.pos.y - dp));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                            this_.finalWay = direction.right_;
                        }
                    } else {
                        nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 + e.size.width * (1 - e.offsetx) + lstatic.ten + jp, s.pos.y + s.OwnSize.height));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 + e.size.width * (1 - e.offsetx) + lstatic.ten + jp, e.pos.y - dp));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                        this_.finalWay = direction.left_;
                    }
                } else {
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, e.pos.y - dp));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                    this_.finalWay = direction.left_;
                }
            } else {
                if (yway <= 0) {
                    if (js == direction.left_) {
                        if (yway == 0) {
                            nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width - lstatic.ten, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width - lstatic.ten, e.pos.y - dp));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                            this_.finalWay = direction.right_;
                        } else {
                            nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 + e.size.width * (1 - e.offsetx) + lstatic.ten + jp, s.pos.y + s.OwnSize.height));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 + e.size.width * (1 - e.offsetx) + lstatic.ten + jp, e.pos.y - dp));
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                            this_.finalWay = direction.left_;
                        }
                    } else {
                        nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 - e.size.width * e.offsetx - lstatic.ten - jp, s.pos.y + s.OwnSize.height));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2 - e.size.width * e.offsetx - lstatic.ten - jp, e.pos.y - dp));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                        this_.finalWay = direction.right_;
                    }
                } else {
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, e.pos.y - dp));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                    this_.finalWay = direction.right_;
                }
            }
            if (e.parent != undefined && e.parent.Type == NodeType.condition) {
                nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                this_.finalWay = direction.down_;
            }
        } else {
            if (Cond) {
                let tp = s.sideType || 0, cs = s.changeSide || false;
                if (toNext) {
                    if (!cs && tp != 2) {
                        let t = Math.min(s.pos.x + s.OwnSize.width / 2 - s.size.width * s.offsetx, e.pos.x - lstatic.dten);
                        nodes.push(new Point(s.pos.x, s.pos.y + s.OwnSize.height / 2));
                        nodes.push(new Point(t, s.pos.y + s.OwnSize.height / 2));
                        nodes.push(new Point(t, e.pos.y - dp));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                        if (e.parent != undefined && e.parent.Type == NodeType.condition) {
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                            this_.finalWay = direction.down_;
                        } else
                            this_.finalWay = direction.right_;
                    } else if (cs && tp != 0) {
                        let t = Math.max(s.pos.x + s.OwnSize.width / 2 + s.size.width * (1 - s.offsetx), e.pos.x + e.OwnSize.width + lstatic.dten);
                        nodes.push(new Point(s.pos.x + s.OwnSize.width, s.pos.y + s.OwnSize.height / 2));
                        nodes.push(new Point(t, s.pos.y + s.OwnSize.height / 2));
                        nodes.push(new Point(t, e.pos.y - dp));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                        if (e.parent != undefined && e.parent.Type == NodeType.condition) {
                            nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                            this_.finalWay = direction.down_;
                        } else
                            this_.finalWay = direction.left_;
                    } else {
                        nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                        nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                        this_.finalWay = direction.down_;
                    }
                } else if (xway == 0) {
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                    this_.finalWay = direction.down_;
                } else if (xway < 0) {
                    nodes.push(new Point(s.pos.x, s.pos.y + s.OwnSize.height / 2));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, s.pos.y + s.OwnSize.height / 2));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                    this_.finalWay = direction.down_;
                } else if (xway > 0) {
                    nodes.push(new Point(s.pos.x + s.OwnSize.width, s.pos.y + s.OwnSize.height / 2));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, s.pos.y + s.OwnSize.height / 2));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                    this_.finalWay = direction.down_;
                }
            } else if (xway == 0) {
                nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                this_.finalWay = direction.down_;
            } else {
                if (s.turnPos != e.turnPos) {
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height + dp))
                    nodes.push(new Point(CalSx(s.turnPos) - sizes[s.turnPos - 1].padding + sp, s.pos.y + s.OwnSize.height + dp))
                    nodes.push(new Point(CalSx(s.turnPos) - sizes[s.turnPos - 1].padding + sp, e.pos.y - dp))
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp))
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y))
                    this_.finalWay = direction.down_;
                } else {
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, s.pos.y + s.OwnSize.height));
                    nodes.push(new Point(s.pos.x + s.OwnSize.width / 2, e.pos.y - dp));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y - dp));
                    nodes.push(new Point(e.pos.x + e.OwnSize.width / 2, e.pos.y));
                    this_.finalWay = direction.down_;
                }
            }
        }

        this_.endPoint = new Point(nodes[nodes.length - 1]);
        this_.startPoint = new Point(nodes[0]);
        this_.line = new Array();
        for (var i = 0; i < nodes.length - 1; i++)
            this_.line.push(new Line(new Point(nodes[i]), new Point(nodes[i + 1])));
    }
    init();
    this.tidy();
}

LineV.prototype.relax = function (rects) {
    var n = 0;
    var rect_ = { r: undefined };
    var HitType = undefined;
    var count = 20;
    while (n + 1 < this.line.length && count > 0) {
        if ((rect_ = IfHit(this.line[n], rects)).t != 0) {
            let rect = rect_.r;
            HitType = rect_.t;
            var direct = GetWay(this.line[n]);
            var x1 = rect.x, x2 = rect.x + rect.w, y1 = rect.y, y2 = rect.y + rect.h;
            switch (HitType) {
                case 1: {
                    let ndir = GetWay(this.line[n + 1]);
                    let p1 = this.line[n].p2, p2 = this.line[n + 1].p1;
                    switch (direct) {
                        case direction.down_:
                            if (ndir == direction.left_) {
                                this.line[n].p2 = new Point(p1.x, y1 - lstatic.relaxl);
                                this.line[n + 1].p1 = new Point(x1 - lstatic.relaxl, p2.x);
                                this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, p2.y, x1 - lstatic.relaxl, y1 - lstatic.relaxl));
                                this.line = this.line.insert(n + 1, new Line(p1.x, y1 - lstatic.relaxl, x1 - lstatic.relaxl, y1 - lstatic.relaxl));
                            } else {
                                this.line[n].p2 = new Point(p1.x, y1 - lstatic.relaxl);
                                this.line[n + 1].p1 = new Point(x2 + lstatic.relaxl, p2.x);
                                this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, p2.y, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                                this.line = this.line.insert(n + 1, new Line(p1.x, y1 - lstatic.relaxl, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                            }
                            break;
                        case direction.up_:
                            if (ndir == direction.left_) {
                                this.line[n].p2 = new Point(p1.x, y2 + lstatic.relaxl);
                                this.line[n + 1].p1 = new Point(x1 - lstatic.relaxl, p2.x);
                                this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y2 + lstatic.relaxl, x1 - lstatic.relaxl, p2.y));
                                this.line = this.line.insert(n + 1, new Line(p1.x, y2 + lstatic.relaxl, x1 - lstatic.relaxl, y2 + lstatic.relaxl));
                            } else {
                                this.line[n].p2 = new Point(p1.x, y1 + lstatic.relaxl);
                                this.line[n + 1].p1 = new Point(x2 + lstatic.relaxl, p2.x);
                                this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y1 - lstatic.relaxl, x2 + lstatic.relaxl, p2.y));
                                this.line = this.line.insert(n + 1, new Line(p1.x, y2 + lstatic.relaxl, x2 + lstatic.relaxl, y2 + lstatic.relaxl));
                            }
                            break;
                        case direction.left_:
                            if (ndir == direction.up_) {
                                this.line[n].p2 = new Point(x2 + lstatic.relaxl, p1.y);
                                this.line[n + 1].p1 = new Point(p2.x, y1 - lstatic.relaxl);
                                this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y1 - lstatic.relaxl, p2.x, y1 - lstatic.relaxl));
                                this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, p1.y, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                            } else {
                                this.line[n].p2 = new Point(x2 + lstatic.relaxl, p1.y);
                                this.line[n + 1].p1 = new Point(p2.x, y2 + lstatic.relaxl);
                                this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y2 + lstatic.relaxl, p2.x, y2 + lstatic.relaxl));
                                this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, p1.y, x2 + lstatic.relaxl, y2 + lstatic.relaxl));
                            }
                            break;
                        case direction.right_:
                            if (ndir == direction.up_) {
                                this.line[n].p2 = new Point(x1 - lstatic.relaxl, p1.y);
                                this.line[n + 1].p1 = new Point(p2.x, y1 - lstatic.relaxl);
                                this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y1 - lstatic.relaxl, p2.x, y1 - lstatic.relaxl));
                                this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, p1.y, x1 - lstatic.relaxl, y1 - lstatic.relaxl));
                            } else {
                                this.line[n].p2 = new Point(x1 - lstatic.relaxl, p1.y);
                                this.line[n + 1].p1 = new Point(p2.x, y2 + lstatic.relaxl);
                                this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y2 + lstatic.relaxl, p2.x, y2 + lstatic.relaxl));
                                this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, p1.y, x1 - lstatic.relaxl, y2 + lstatic.relaxl))
                            }
                            break;
                    }
                    break;
                }
                case 2: {
                    let p1 = this.line[n].p1, p2 = this.line[n].p2;
                    if (direct == direction.up_) {
                        this.line = this.line.insert(n + 1, new Line(p1.x, y1 - lstatic.relaxl, p2.x, p2.y));
                        if (this.endPoint.x > this.startPoint.x) {
                            this.line = this.line.insert(n + 1, new Line(p1.x, y1 - lstatic.relaxl, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y2 + lstatic.relaxl, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(p1.x, y2 + lstatic.relaxl, x2 + lstatic.relaxl, y2 + lstatic.relaxl));
                        } else {
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y1 - lstatic.relaxl, p1.x, y1 - lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y2 + lstatic.relaxl, x1 - lstatic.relaxl, y1 - lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(p1.x, y2 + lstatic.relaxl, x1 - lstatic.relaxl, y2 + lstatic.relaxl));
                        }
                        this.line = this.line.insert(n + 1, new Line(p1.x, p1.y, p2.x, y2 + lstatic.relaxl));
                    } else {
                        this.line = this.line.insert(n + 1, new Line(p2.x, y2 + lstatic.relaxl, p1.x, p2.y));
                        if (this.endPoint.x > this.startPoint.x) {
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y2 + lstatic.relaxl, p1.x, y2 + lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y1 - lstatic.relaxl, x2 + lstatic.relaxl, y2 + lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(p1.x, y1 - lstatic.relaxl, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                        } else {
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y2 + lstatic.relaxl, p1.x, y2 + lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y1 - lstatic.relaxl, x1 - lstatic.relaxl, y2 + lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(p1.x, y1 - lstatic.relaxl, x1 - lstatic.relaxl, y1 - lstatic.relaxl));
                        }
                        this.line = this.line.insert(n + 1, new Line(p2.x, p1.y, p1.x, y1 - lstatic.relaxl));
                    }
                    this.line = this.line.erase(n);
                    break;
                }
                case 3: {
                    var p1 = this.line[n].p1, p2 = this.line[n].p2;
                    if (direct == direction.right_) {
                        this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, p1.y, p2.x, p1.y));
                        if (this.endPoint.y > this.startPoint.y) {
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y2 + lstatic.relaxl, x2 + lstatic.relaxl, p2.y));
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y2 + lstatic.relaxl, x2 + lstatic.relaxl, y2 + lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, p1.y, x1 - lstatic.relaxl, y2 + lstatic.relaxl));
                        } else {
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y1 - lstatic.relaxl, x2 + lstatic.relaxl, p2.y));
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y1 - lstatic.relaxl, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, p1.y, x1 - lstatic.relaxl, y1 - lstatic.relaxl));
                        }
                        this.line = this.line.insert(n + 1, new Line(p1.x, p1.y, x1 - lstatic.relaxl, p1.y));
                    } else {
                        this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, p2.y, p2.x, p2.y));
                        if (this.endPoint.y > this.startPoint.y) {
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y2 + lstatic.relaxl, x1 - lstatic.relaxl, p2.y));
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y2 + lstatic.relaxl, x1 - lstatic.relaxl, y2 + lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, p1.y, x2 + lstatic.relaxl, y2 + lstatic.relaxl));
                        } else {
                            this.line = this.line.insert(n + 1, new Line(x1 - lstatic.relaxl, y1 - lstatic.relaxl, x1 - lstatic.relaxl, p2.y));
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, y1 - lstatic.relaxl, x1 - lstatic.relaxl, y1 - lstatic.relaxl));
                            this.line = this.line.insert(n + 1, new Line(x2 + lstatic.relaxl, p1.y, x2 + lstatic.relaxl, y1 - lstatic.relaxl));
                        }
                        this.line = this.line.insert(n + 1, new Line(p1.x, p1.y, x2 + lstatic.relaxl, p1.y));
                    }
                    this.line = this.line.erase(n);
                    break;
                }
            }
            count--;
        } else
            n++;
    }
    this.tidy();
}

LineV.prototype.tidy = function () {
    var n = 0, N = 0;
    while (n + 1 < this.line.length && N < 100) {
        var sp1 = this.line[n].p1, sp2 = this.line[n].p2;
        var ep2 = this.line[n + 1].p2;
        var sw = GetWay(this.line[n]), ew = GetWay(this.line[n + 1]);
        if (CmpPoint(sp1, sp2)) {
            this.line = this.line.erase(n);
            n = 0;
        }
        else if (sw == ew || sw == -ew) {
            this.line[n].p2 = ep2;
            this.line = this.line.erase(n + 1);
            n = 0;
        } else
            n++;
        N++;
    }
    N = 0;
    n = 0;
    while (n < this.line.length && N < 100) {
        let sp1 = this.line[n].p1, sp2 = this.line[n].p2;
        if (CmpPoint(sp1, sp2)) {
            this.line = this.line.erase(n);
            n = 0;
        }
        else
            n++;
        N++;
    }
    if (this.line.length > 0)
        this.finalWay = GetWay(this.line[this.line.length - 1]);
}

function RemoveSpace(text) {
    var p = text.length - 1;
    while (p >= 0) {
        if (text.charAt(p) == ' ' || text.charAt(p) == '\n')
            p--;
        else
            break;
    }
    text = text.substr(0, p + 1);
    var t = text.split('\n');
    for (let i = 0; i < t.length; i++) {
        p = 0;
        while (p < t[i].length && t[i].charAt(p) == ' ')
            p++;
        t[i] = t[i].remove(0, p);
    }
    return t.join('\n');
}

function SliceText(arr, s, e) {
    let t = []
    if (s.y == e.y)
        t.push(arr[s.y].slice(s.x, e.x))
    else {
        t.push(arr[s.y].slice(s.x));
        for (let i = s.y + 1; i <= e.y - 1; i++)
            t.push(arr[i])
        t.push(arr[e.y].slice(0, e.x));
    }
    return t.join('\n')
}

function IndexOf(arr, s, ch) {
    let l = s.y;
    while (l < arr.length) {
        let x = arr[l].indexOf(ch);
        if (x != -1 && (l != s.y || x > s.x))
            return { x: x, y: l };
        l++;
    }
    return undefined;
}

const Wrong = {
    Ending: '需要语句结束符 ;',
    UseLessText: '这里不应该出现多余的文字',
    FunctionLost: '找不到这个函数',
    StrangeLBrace: '意外的符号 {',
    StrangeRBrace: '意外的符号 }',
    StrangeRBRacket: '意外的符号 )',
    Endless: 'Endless',
    FunctionReadErr: '无法读取这个函数',
    FunctionErr: '函数内部错误: ',
    NullTrueNode: '不可以有一个空的正确语句块',
    NullFalseNode: '错误语句块为空，请删除 {}',
    LabelReUse: '这个标签已经用过了',
    DuubleLabel: '不可以在同一语句使用多个标签',
    LabelBeforeIn: '在关键字in前不可以有标签',
    IninMiddle: '关键字 in 需要出现在开头',
    OutinMiddle: '关键字 out 不应该在中间出现',
    GotoErr: '在 goto 后不能有语句',
    IfWrong: '请填写正确的if语句',
    FuncWriteErr: '在 [ 的右边需要有 ] '
}

function DiliverPart(Code, Name, IsFunc, Now) {
    Code = Code.join('\n').split('\n');

    let BraceType = { InTrueNode: 0, WaitTrue: 1, InFalseNode: 2, WaitFalse: 3, InActionNode: 4, WaitAction: 6, None: 7, WaitWhile: 8, InWhileNode: 9 };
    let idx = 0, idy = 0, length = Code.length, idx_r = 0, idy_r = 0;
    let BehindKey = false, LineStart = true, CapContent = false, endline = false, GetIn = false, GetOut = false, GetTurn = false,
        hasLabel = false, waitend = false;
    let Stage = new Array;
    let NodeLabel = {};
    let LabelName;
    Stage.unshift(BraceType.None);
    let type = NodeType.none;
    let Head = undefined;
    let NowLength;
    if (!IsFunc) {
        Now = new Array;
        Head = new ChartNode(NodeType.head);
        Now.unshift(Head);
    } else {
        Head = Now[0];
        NowLength = Now.length;
    }
    let WaitComplete = {};
    let CondNode = new Array;
    let FuncNode = undefined;

    let misLine = []
    let lineNode = {}
    let hasStyle = false;
    let StylePos;

    try {
        var Functions = {};
        idy = 0
        while (idy < length) {
            if (Code[idy].slice(0, 8) == 'function') {
                idy_r = idy;
                let funcName = '';
                let k = Code[idy_r].indexOf('[', 8);
                if (k == -1) {
                    idy_r++;
                    k = Code[idy_r]?.indexOf('[');
                    if (k == undefined || k == -1)
                        throw '函数书写错误，缺少[，[需要紧跟函数名背后或在下一行';
                    else if (k == Code[idy_r].length - 1)
                        funcName = Code[idy].slice(8);
                    else
                        throw '[ 后请换行书写'
                } else if (k != Code[idy_r].length - 1)
                    throw '[ 后请换行书写'
                funcName = Code[idy].slice(8, k);
                idy_r++;
                let e = IndexOf(Code, { x: 0, y: idy_r }, ']');
                if (e == undefined)
                    throw '函数书写错误，缺少]'
                else if (Code[e.y].replace(/ /g, '') == ']') {
                    let t = Code.slice(idy_r, e.y);
                    if (t == null || !t || t.length == 0)
                        throw '函数为空，请删除'
                    misLine.push({ s: idy, e: e.y });
                    Functions[funcName.replace(/ /g, '')] = { content: t, s: idy_r };
                    idy = e.y;
                }
                else
                    throw '] 需独自一行，请换行书写'
            }
            idy++;
        }

        idy = 0

        while (idy < length && Now.length != 0) {
            if (idy == misLine[0]?.s) {
                idy = misLine[0].e + 1;
                misLine.shift();
                continue;
            }
            var ch = Code[idy].charAt(idx);
            if (ch == '\\') {
                if (BehindKey) {
                    throw Wrong.UseLessText;
                }
                LineStart = false;
                Code[idy] = Code[idy].remove(idx, 1);
            } else if (!hasStyle) {
                if (!(Stage[0] == BraceType.InActionNode && ch != '}' && !LineStart)) {
                    if (Stage[0] == BraceType.WaitFalse && type != NodeType.ElseIfCond && NotSpace.test(ch) && (ch != 'e' && ch != '{')) {
                        Stage.shift();
                        CondNode.shift();
                    }
                    switch (ch) {
                        case ';':
                            StylePos = idx;
                            hasStyle = true;
                            break;
                        case ' ':
                        case '\t':
                            break;
                        case '(':
                            if (GetIn || GetOut) {
                                if (LineStart) {
                                    LineStart = false;
                                    idx_r = idx;
                                    idy_r = idy;
                                }
                                break;
                            }
                            LineStart = false;
                            if (!CapContent && BehindKey && (type == NodeType.condition || type == NodeType.whileCond || type == NodeType.ElseIfCond)) {
                                let CondNode_ = new ConditionNode();
                                lineNode[idy] = CondNode_;
                                CondNode_.lineAt = idy
                                if (type == NodeType.ElseIfCond) {
                                    if (CondNode[0] == undefined)
                                        throw '意外的elseif';
                                    else {
                                        Stage.shift();
                                        CondNode[0].FalseNode = CondNode_;
                                        CondNode.shift();
                                        //Now[0] = CondNode[0];
                                    }
                                } else {
                                    CondNode_.parent = Now[0];
                                    Now[0].NextNode = CondNode_;
                                    Now[0] = CondNode_;
                                }
                                CondNode.unshift(CondNode_);
                                CapContent = true;
                                idx_r = idx + 1;
                                BehindKey = false;
                            } else if (!CapContent) {
                                FuncNode = new FunctionNode();
                                lineNode[idy] = FuncNode;
                                FuncNode.lineAt = idy
                                FuncNode.FunctionName = Code[idy].slice(idx_r, idx);
                                if (Functions[FuncNode.FunctionName] != undefined) {
                                    //throw Wrong.FunctionLost + ' [' + FuncNode.FunctionName + ']';
                                    Function.parent = Now[0];
                                    Now[0].NextNode = FuncNode;
                                    Now[0] = FuncNode;
                                    if (hasLabel)
                                        NodeLabel[LabelName] = Now[0];
                                    CapContent = true;
                                    idx_r = idx + 1;
                                    type = NodeType.func;
                                }
                            }
                            break;
                        case '{':
                            if (GetIn || GetOut) {
                                if (LineStart) {
                                    LineStart = false;
                                    idx_r = idx;
                                    idy_r = idy;
                                }
                                break;
                            }
                            LineStart = true;
                            BehindKey = false;
                            if (idx != Code[idy].length - 1 && Code[idy].indexOf(';', idx) == -1)
                                throw '{ 后请换行书写'
                            endline = true;
                            if (Stage.length == 0)
                                throw Wrong.StrangeLBrace;
                            else if (Stage[0] == BraceType.WaitTrue) {
                                Stage[0] = BraceType.InTrueNode;
                                let t = new ChartNode(NodeType.none);
                                CondNode[0].TrueNode = t;
                                Now.unshift(t);
                            } else if (Stage[0] == BraceType.WaitFalse) {
                                Stage[0] = BraceType.InFalseNode;
                                let t = new ChartNode(NodeType.none);
                                CondNode[0].FalseNode = t;
                                Now.unshift(t);
                            } else if (Stage[0] == BraceType.WaitAction) {
                                Stage[0] = BraceType.InActionNode;
                            } else if (Stage[0] == BraceType.WaitWhile) {
                                Stage[0] = BraceType.InWhileNode;
                                let t = new ChartNode(NodeType.none);
                                CondNode[0].TrueNode = t;
                                Now.unshift(t);
                            }
                            else
                                throw Wrong.StrangeLBrace;
                            break;
                        case ')':
                            if (GetIn || GetOut) {
                                if (LineStart) {
                                    LineStart = false;
                                    idx_r = idx;
                                    idy_r = idy;
                                }
                                break;
                            }
                            LineStart = true;
                            if (CapContent && (type == NodeType.condition || type == NodeType.whileCond || type == NodeType.ElseIfCond)) {
                                CondNode[0].Content = Code[idy].slice(idx_r, idx);
                                if (type == NodeType.condition || type == NodeType.ElseIfCond)
                                    Stage.unshift(BraceType.WaitTrue);
                                else
                                    Stage.unshift(BraceType.WaitWhile)
                                if (hasLabel) {
                                    NodeLabel[LabelName] = Now[0];
                                    hasLabel = false;
                                }
                            } else if (CapContent && type == NodeType.func) {
                                FuncNode.Content = Code[idy].slice(idx_r, idx);
                                if (FuncNode.FunctionName == Name) {
                                    throw Wrong.Endless;
                                } else {
                                    let f_code;
                                    if (Functions[FuncNode.FunctionName] != undefined)
                                        f_code = Functions[FuncNode.FunctionName];
                                    else
                                        throw Wrong.FunctionReadErr;
                                    try {
                                        DiliverPart(f_code.content, Name, true, Now);
                                    } catch (e) {
                                        let err = e.error;
                                        idy = f_code.s + e.line;
                                        throw err;
                                    }
                                }
                            }
                            else {
                                LineStart = false;
                                //throw Wrong.StrangeRBRacket;
                                break;
                            }
                            type = NodeType.none;
                            endline = true;
                            CapContent = false;
                            break;
                        case '}':
                            if (GetIn || GetOut) {
                                if (LineStart) {
                                    LineStart = false;
                                    idx_r = idx;
                                    idy_r = idy;
                                }
                                break;
                            }
                            if (idx != Code[idy].length - 1 && Code[idy].indexOf(';', idx) == -1 && Code[idy].indexOf('else', idx) == -1)
                                throw '} 后请换行书写'
                            LineStart = true;
                            waitend = false;
                            if (Stage.length == 0) {
                                throw Wrong.StrangeRBrace;
                            }
                            else if (Stage[0] == BraceType.InTrueNode) {
                                let N = CondNode[0].TrueNode;
                                CondNode[0].TrueNode = N.NextNode;
                                if (CondNode[0].TrueNode == undefined)
                                    throw Wrong.NullTrueNode;
                                Now.shift();
                                Stage.shift();
                                endline = true;
                                Stage.unshift(BraceType.WaitFalse);
                            } else if (Stage[0] == BraceType.InWhileNode) {
                                let N = CondNode[0].TrueNode;
                                CondNode[0].TrueNode = N.NextNode;
                                if (CondNode[0].TrueNode == undefined)
                                    throw Wrong.NullTrueNode;
                                let G = new ChartNode(NodeType.jump);
                                G.Content = 'JumpToCond';
                                G.NextNode = CondNode[0];
                                G.whileback = true;
                                CondNode[0].Iswhile = true;
                                Now[0].NextNode = G;
                                Now.shift();
                                Stage.shift();
                                CondNode.shift();
                                endline = true;
                            } else if (Stage[0] == BraceType.InFalseNode) {
                                let N = CondNode[0].FalseNode;
                                CondNode[0].FalseNode = N.NextNode;
                                if (CondNode[0].FalseNode == undefined)
                                    throw Wrong.NullFalseNode;
                                Now.shift();
                                Stage.shift();
                                CondNode.shift();
                                endline = true;
                            } else if (CondNode.length > 1 && Stage[0] == BraceType.WaitFalse) {
                                Stage.shift();
                                CondNode.shift();
                                continue;
                            } else if (Stage[0] == BraceType.InActionNode) {
                                let AcNode = new ActionNode();
                                lineNode[idy] = AcNode;
                                AcNode.lineAt = idy
                                AcNode.Content = RemoveSpace(SliceText(Code, { x: idx_r, y: idy_r }, { x: idx, y: idy }));
                                AcNode.parent = Now[0];
                                Now[0].NextNode = AcNode;
                                Now[0] = AcNode;
                                if (hasLabel) {
                                    hasLabel = false;
                                    NodeLabel[LabelName] = Now[0];
                                }
                                endline = true;
                                Stage.shift();
                            } else
                                throw Wrong.StrangeRBrace;
                            break;
                        case ':':
                            if (hasLabel)
                                throw Wrong.DuubleLabel;
                            LabelName = Code[idy].slice(idx_r, idx).replace(" ", "");
                            if (LabelName == 'end')
                                throw '不可以使用 end 作为标签名'
                            if (NodeLabel[LabelName] != undefined)
                                throw Wrong.LabelReUse;
                            hasLabel = true;
                            LineStart = true;
                            break;
                        default:
                            DEFAULT:
                            if (BehindKey) {
                                throw Wrong.UseLessText;
                            }
                            if (ch == 'i') {
                                if (Code[idy].substr(idx, 2) == "if" && !LetterTest.test(Code[idy][idx + 2])) {
                                    idx += 1;
                                    BehindKey = true;
                                    LineStart = false;
                                    type = NodeType.condition;
                                } else if (Code[idy].substr(idx, 2) == "in" && !LetterTest.test(Code[idy][idx + 2])) {
                                    idx += 2;
                                    GetIn = true;
                                    LineStart = true;
                                    continue;
                                }
                            }
                            else if (ch == 'e' && Code[idy].substr(idx, 4) == "else" && !LetterTest.test(Code[idy][idx + 4])) {
                                idx += 3;
                                BehindKey = true;
                                LineStart = false;
                            }
                            else if (ch == 'e' && Code[idy].substr(idx, 6) == "elseif" && !LetterTest.test(Code[idy][idx + 6])) {
                                idx += 5;
                                BehindKey = true;
                                LineStart = false;
                                type = NodeType.ElseIfCond;
                            }
                            else if (ch == 'o' && Code[idy].substr(idx, 3) == "out" && !LetterTest.test(Code[idy][idx + 3])) {
                                idx += 3;
                                GetOut = true;
                                LineStart = true;
                                continue;
                            } else if (ch == 'g' && Code[idy].substr(idx, 4) == "goto" && !LetterTest.test(Code[idy][idx + 4])) {
                                idx += 4;
                                type = NodeType.jump;
                                LineStart = true;
                                continue;
                            } else if (ch == 't' && Code[idy].substr(idx, 4) == "turn" && !LetterTest.test(Code[idy][idx + 4])) {
                                idx += 4;
                                GetTurn = true;
                                LineStart = true;
                                continue;
                            } else if (ch == 'd' && Code[idy].substr(idx, 2) == "do" && !LetterTest.test(Code[idy][idx + 2])) {
                                idx += 1;
                                BehindKey = true;
                                LineStart = false;
                                Stage.unshift(BraceType.WaitAction);
                            } else if (ch == 'w' && Code[idy].substr(idx, 5) == "while" && !LetterTest.test(Code[idy][idx + 5])) {
                                idx += 4;
                                BehindKey = true;
                                LineStart = false;
                                type = NodeType.whileCond;
                            }
                            if (LineStart) {
                                LineStart = false;
                                if (waitend)
                                    throw Wrong.GotoErr;
                                if (Stage.length != 0 && Stage[0] == BraceType.WaitTrue)
                                    throw Wrong.IfWrong;
                                if (!CapContent) {
                                    if (type != NodeType.jump) {
                                        if (Stage.length == 0)
                                            type = NodeType.none;
                                        else if (Stage[0] == BraceType.WaitFalse) {
                                            Stage.shift();
                                            CondNode.shift();
                                        }
                                    }
                                    idx_r = idx;
                                    idy_r = idy;
                                }

                            }
                            break;
                    }
                }

            }

            idx++;

            if (idx >= Code[idy].length) { //new line
                if (!LineStart && Stage.length != 0 && Stage[0] == BraceType.InActionNode) {
                    idy += 1;
                    idx = 0;
                    continue;
                }//turn not work for a new line at do node

                if (GetIn) {
                    let InputNode = new ChartNode(NodeType.input);
                    lineNode[idy] = InputNode;
                    InputNode.lineAt = idy;
                    let content = Code[idy].slice(idx_r, idx).split(';');
                    InputNode.Content = content[0];
                    InputNode.parent = Now[0];
                    Now[0].NextNode = InputNode;
                    Now[0] = InputNode;
                    GetIn = false;
                    CapContent = false;
                    if (hasLabel)
                        NodeLabel[LabelName] = InputNode;
                } else if (GetTurn) {
                    let TurnNode = new ChartNode(NodeType.turn);
                    lineNode[idy] = TurnNode;
                    TurnNode.lineAt = idy;
                    let content = Code[idy].slice(idx_r, idx).split(';')[0].replace(/ /g, '');
                    if (/[^0-9.]/.test(content) || content == '')
                        throw '请输入数字'
                    if (Now.length != 1 || IsFunc)
                        throw '禁止在函数或非主分支使用 turn'
                    if (Now[0] == Head)
                        throw '禁止在开头使用 turn'
                    TurnNode.Content = content;
                    TurnNode.parent = Now[0];
                    Now[0].NextNode = TurnNode;
                    Now[0] = TurnNode;
                    GetTurn = false;
                    CapContent = false;
                    if (hasLabel)
                        throw 'turn 前不可以有标签'
                } else if (GetOut) {
                    if (IsFunc) {
                        if (NowLength == Now.length) {
                            if (hasLabel)
                                throw '关键字 out 前不可以有标签'
                            Object.keys(WaitComplete).forEach(item => {
                                let t = WaitComplete[item].Node.Content;
                                if (NodeLabel[t] != undefined)
                                    WaitComplete[item].Node.NextNode = NodeLabel[t];
                                else {
                                    idy = WaitComplete[item].line;
                                    throw "找不到标签 [" + t + "]";
                                }
                            })

                            if (Now[0] instanceof ConditionNode) {
                                let N = new ActionNode();
                                N.Content = 'output';
                                N.OutContent = Code[idy].slice(idx_r, idx);
                                N.FuncEnd = true;
                                Now[0].NextNode = N;
                                Now[0] = N;
                                return undefined;
                            }
                            Now[0].FuncEnd = true;
                            Now[0].OutContent = Code[idy].slice(idx_r, idx);

                            return undefined;
                        } else
                            throw Wrong.OutinMiddle;
                    }
                    else
                        throw '关键字 out 应在函数中使用'
                } else if (!CapContent && type == NodeType.none && !endline) {
                    let AcNode = new ActionNode();
                    lineNode[idy] = AcNode;
                    AcNode.lineAt = idy;
                    let content = Code[idy].slice(idx_r, idx).split(';');
                    AcNode.Content = content[0];
                    if (AcNode.Content != '') {
                        AcNode.parent = Now[0];
                        Now[0].NextNode = AcNode;
                        Now[0] = AcNode;
                        if (hasLabel) {
                            hasLabel = false;
                            NodeLabel[LabelName] = Now[0];
                        }
                    }
                } else if (!CapContent && type == NodeType.jump) {
                    if (hasLabel)
                        throw 'goto 语句前不可以有标签'
                    let JNode = new ChartNode(NodeType.jump);
                    lineNode[idy] = JNode;
                    JNode.lineAt = idy;
                    let content = Code[idy].slice(idx_r, idx).split(';');
                    JNode.Content = content[0];
                    Now[0].NextNode = JNode;
                    Now[0] = JNode;
                    WaitComplete[idx] = { 'Node': JNode, 'line': idy };
                    endline = true;
                    waitend = true;
                    type = NodeType.none;
                }

                hasLabel = false;

                if (hasStyle && lineNode[idy] != undefined) {
                    lineNode[idy].style = Code[idy].slice(StylePos + 1);
                    if (lineNode[idy].style != undefined) {
                        let s = lineNode[idy].style.split(',');
                        s.forEach(i => {
                            let info = i.split(':');
                            info[1] = info[1]?.replace(/ /g, '')
                            if (info[0] == 'changeSide')
                                lineNode[idy][info[0]] = info[1] == 'false' ? false : true;
                            else if (info[0] == 'hideFalse')
                                lineNode[idy][info[0]] = info[1] == 'true' ? true : false;
                            else if (info[0] == 'jumpSide')
                                lineNode[idy][info[0]] = info[1] == 'left' ? direction.left_ : direction.right_;
                            else if (info[0] == 'sideType')
                                lineNode[idy][info[0]] = (/[^0-9]/.test(info[1]) || info[1] == '') ? 2 : Number(info[1]);
                            else if (info[0].slice(-4) == 'Text')
                                lineNode[idy][info[0]] = info[1];
                            else if (info[0] != '')
                                lineNode[idy][info[0]] = Number(info[1]);
                        })

                    }
                }

                idy += 1;
                idx = 0;
                endline = false;
                LineStart = true;
                hasStyle = false;
                StylePos = undefined;
            }
        }
        if (Stage.length != 0 && (Stage[0] == BraceType.InTrueNode || Stage[0] == BraceType.InFalseNode || Stage[0] == BraceType.InActionNode))
            throw "在 { 后需要有 }";
        if (CapContent)
            throw "在 ( 后需要有 )";
        if (waitend)
            throw "goto 不可以在主分支中";

        if (IsFunc) {
            Now[0].FuncEnd = true;
            return undefined;
        }
        let Final = new ChartNode(NodeType.final);
        Final.parent = Now[0];
        Now[0].NextNode = Final;

        Object.keys(WaitComplete).forEach(item => {
            let t = WaitComplete[item].Node.Content;
            if (NodeLabel[t] != undefined)
                WaitComplete[item].Node.NextNode = NodeLabel[t];
            else if (t == 'end') {
                WaitComplete[item].Node.NextNode = Final;
            } else {
                idy = WaitComplete[item].line;
                throw "找不到标签 [" + t + "]";
            }
        })

    } catch (error) {
        let e = error;
        if (e == "Endless" && IsFunc) {
            if (IsFunc)
                throw "函数内有调用源文件的语句";
            else
                e = "不可以调用自身";
        }
        throw {
            error: '代码错误，在行 ' + (idy == -1 ? '无法定位' : idy + 1) + " : " + e,
            line: idy + 1
        }
    }

    return Head;
}

function DrawRect(x, y, w, h, sw) {
    if (arguments.length == 2) {
        let r = x;
        return '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" stroke="black" fill="transparent" stroke-width="' + y + '"/>';
    } else {
        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" stroke="black" fill="transparent" stroke-width="' + sw + '"/>';
    }
}

function DrawRect_(x, y, w, h, rx, ry, sw) {
    if (arguments.length == 4) {
        let r = x;
        return '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" rx="' + y + '" ry="' + w + '" stroke="black" fill="transparent" stroke-width="' + h + '"/>';
    } else {
        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" ry="' + ry + '" stroke="black" fill="transparent" stroke-width="' + sw + '"/>';
    }
}

function DrawLines(lines, sw) {
    var t = [];
    lines.forEach(i => {
        t.push('<line x1="' + i.p1.x + '" y1="' + i.p1.y + '" x2="' + i.p2.x + '" y2="' + i.p2.y + '" stroke="black" stroke-width="' + sw + '"/>');
    })
    return t.join('\n');
}

function DrawPoly(p1, p2, p3, p4, sw) {
    var t = '<path stroke="black" fill="transparent" stroke-width="' + sw + '" d="';
    t += 'M' + p1.x + ',' + p1.y + ' ';
    t += 'L' + p2.x + ',' + p2.y + ' ';
    t += 'L' + p3.x + ',' + p3.y + ' ';
    t += 'L' + p4.x + ',' + p4.y + ' Z';
    t += '" fill-rule="evenodd"/>';
    return t;
}

function DrawText(r, s, isSmall = false) {
    var t = '<text font-family="consolas" font-size="' + (Number(ts) + (isSmall ? -6 : 0)) + 'px" fill="black" font-weight="bold" text-anchor="middle"';
    t += 'y="' + (r.y + r.h / 2) + '">';
    var sl = s.split('\n');
    let c = 0;
    sl.forEach(i => {
        if (i == '')
            c++;
    })
    sl.forEach((i, p) => {
        if (!p)
            t += '<tspan x="' + (r.x + r.w / 2) + '" dy="' + (-(sl.length - c) * fh / 2 + p * fh + fh / 2) + '">' + i + '</tspan>';
        else
            t += '<tspan x="' + (r.x + r.w / 2) + '" dy="' + fh + '">' + i + '</tspan>';
    });
    t += '</text>';
    return t;
}

function DrawText_(x, y, s, anchor, isSmall = false, verticalAlign = null) {
    var t = '<text font-family="consolas" font-size="' + (Number(ts) + (isSmall ? -6 : 0)) + 'px" fill="black" font-weight="bold" text-anchor="' + anchor + '"';
    if (verticalAlign != null) {
        t += ' dominant-baseline="' + verticalAlign + '"';
    }
    t += 'x="' + x + '" ';
    t += 'y="' + y + '">';
    t += s + "</text>";
    return t;
}

function Wash(node) {
    if (node.NextNode != undefined && node.Type != NodeType.jump) {
        Wash(node.NextNode);
    }
    if (node.TrueNode != undefined) {
        Wash(node.TrueNode);
    }
    if (node.FalseNode != undefined) {
        Wash(node.FalseNode);
    }
    node.pos = undefined;
    node.size = undefined;
    node.isDraw = undefined;
    if (node.end)
        node.NextNode = undefined;
    node.end = undefined;
}

function ConnectNode(Head, rects) {
    var Now = new Array();
    var CondNodes = new Array();
    var lines = new Array();
    lines.push(new LineV(Head, Head.NextNode));

    Now.push(Head.NextNode);
    CondNodes.push(undefined);
    while (Now != undefined && Now.length != 0) {
        if (Now[0] == undefined) {
            Now.shift();
            CondNodes.shift();
        } else {
            let node = Now[0];
            let line;
            if (node.Type == NodeType.condition) {
                let CondNode = node;
                if (node.NextNode == undefined) {
                    if (CondNodes[0] != undefined) {
                        if (CondNodes[0].NextNode.Type == NodeType.jump) {
                            node.NextNode = CondNodes[0].NextNode.clone();
                            node.NextNode.pos = new Point(node.pos.x + node.OwnSize.width / 2, node.pos.y + node.OwnSize.height);
                        }
                        else {
                            node.NextNode = CondNodes[0].NextNode
                            node.end = true;
                        }
                    }
                    CondNodes.shift();
                    Now.shift();
                } else if (node.NextNode.Type != NodeType.jump) {
                    Now[0] = node.NextNode;
                } else {
                    CondNodes.shift();
                    Now.shift();
                }

                line = new LineV(node, CondNode.TrueNode, false, true);
                console.log(CondNode.hideFalse)

                lines.push(line);
                Now.push(CondNode.TrueNode);
                CondNodes.push(CondNode);

                if (CondNode.FalseNode != undefined) {
                    line = new LineV(node, CondNode.FalseNode, false, true);
                    if (!CondNode.hideFalse)
                        lines.push(line);
                    Now.push(CondNode.FalseNode);
                    CondNodes.push(CondNode);
                } else {
                    if (CondNode.NextNode != undefined) {
                        if (CondNode.NextNode.Type == NodeType.jump) {
                            let cs = CondNode.changeSide || false, tp = CondNode.sideType || 0;
                            CondNode.FalseNode = CondNode.NextNode.clone();
                            if (!cs && tp != 2)
                                CondNode.FalseNode.pos = new Point(CondNode.pos.x - lstatic.ten, CondNode.pos.y + CondNode.OwnSize.height / 2);
                            else if (cs && tp != 0)
                                CondNode.FalseNode.pos = new Point(CondNode.pos.x + CondNode.OwnSize.width + lstatic.ten, CondNode.pos.y + CondNode.OwnSize.height / 2);
                            else
                                CondNode.FalseNode.pos = new Point(CondNode.pos.x + CondNode.OwnSize.width / 2, CondNode.pos.y + CondNode.OwnSize.height + lstatic.ten);
                            if (!CondNode.hideFalse)
                                lines.push(new LineV(node, CondNode.FalseNode, false, true));
                            Now.push(CondNode.FalseNode);
                            CondNodes.push(CondNode);
                        } else if (!CondNode.hideFalse)
                            lines.push(new LineV(node, CondNode.NextNode, false, true, true));
                    }
                }
            } else if (node.NextNode != undefined) {
                if (node.Type == NodeType.jump) {
                    line = new LineV(node, node.NextNode, true);
                    lines.push(line);
                    line.relax(rects);
                    Now.shift();
                    CondNodes.shift();
                } else {
                    line = new LineV(node, node.NextNode);
                    lines.push(line);
                    Now[0] = node.NextNode;
                }
            } else {
                if (CondNodes[0] != undefined) {
                    if (CondNodes[0].NextNode.Type == NodeType.jump) {
                        node.NextNode = CondNodes[0].NextNode.clone();
                        node.NextNode.pos = new Point(node.pos.x + node.OwnSize.width / 2, node.pos.y + node.OwnSize.height + lstatic.ten);
                        lines.push(new LineV(node, node.NextNode));
                        lines.push(new LineV(node.NextNode, node.NextNode.NextNode, true));
                    } else {
                        node.NextNode = CondNodes[0].NextNode
                        node.end = true;
                        lines.push(new LineV(node, node.NextNode));
                    }

                }
                CondNodes.shift();
                Now.shift();
            }
        }
    }
    return lines;
}

function Draw(Head, doc, sw, ts_) {
    ts = ts_;
    fh = undefined;
    sizes = []
    var Svg = new Array;
    var PaperSize;
    try {
        GetSize2(Head, doc);
        sizes.push({ width: Head.size.width, height: Head.size.height });
        let ys = []
        sizes.forEach(i => {
            ys.push(i.height);
        })
        PaperSize = new Size(CalSx(0), Math.max(...ys));
    } catch (e) {
        console.log(e);
        return;
    }
    var JumpCount = GetJumpCount(Head);
    var bal = 25 + lstatic.ten * JumpCount;
    var width = PaperSize.width + 50 + 2 * lstatic.ten * JumpCount;
    var height = PaperSize.height + 50 + 2 * lstatic.ten * JumpCount;

    var Rects = new Array;
    try {
        CalculPos2(Head, Rects, 0, 0);
    } catch (e) {
        console.log(e)
        return;
    }
    try {
        var lines = ConnectNode(Head, Rects);
    } catch (e) {
        console.log(e);
        return;
    }

    var now = new Array;
    now.push(Head);

    while (now.length != 0) {
        if (now[0] == undefined || now[0].isDraw) {
            now.shift();
            continue;
        }
        if (now[0].Type == NodeType.none)
            now[0] = now[0].NextNode;
        else if (now[0].Type == NodeType.jump) {
            let pos = now[0].pos;
            pos.x += bal;
            pos.y += bal;
            now.shift();
        }
        else {
            now[0].isDraw = true;
            let pos = now[0].pos;
            pos.x += bal;
            pos.y += bal;
            let size = now[0].OwnSize;
            let rect = new Rect(pos.x, pos.y, size.width, size.height);
            if (now[0].Type == NodeType.head || now[0].Type == NodeType.final)
                Svg.push(DrawRect_(rect, 10, 10, sw));
            else if (now[0].Type == NodeType.input) {
                let p1 = new Point(rect.x + lstatic.ten / 2, rect.y);
                let p2 = new Point(rect.x + rect.w, rect.y);
                let p3 = new Point(rect.x + rect.w - lstatic.ten / 2, rect.y + rect.h);
                let p4 = new Point(rect.x, rect.y + rect.h);
                Svg.push(DrawPoly(p1, p2, p3, p4, sw));
            }
            else if (now[0].Type == NodeType.condition) {
                let p1 = new Point(rect.x + rect.w / 2, rect.y);
                let p2 = new Point(rect.x + rect.w, rect.y + rect.h / 2);
                let p3 = new Point(rect.x + rect.w / 2, rect.y + rect.h);
                let p4 = new Point(rect.x, rect.y + rect.h / 2);
                Svg.push(DrawPoly(p1, p2, p3, p4, sw));
            } else if (now[0].Type != NodeType.func)
                Svg.push(DrawRect(rect, sw));

            if (now[0].Type == NodeType.head)
                Svg.push(DrawText(rect, 'start'));
            else if (now[0].Type == NodeType.final)
                Svg.push(DrawText(rect, 'end'));
            else if (now[0].Type == NodeType.func) {
                Svg.push(DrawText_(rect.x + rect.w / 2 + 2, rect.y + rect.h - lstatic.ten, now[0].Content, 'start', true));
            } else
                Svg.push(DrawText(rect, now[0].Content));
            if (now[0].FuncEnd) {
                Svg.push(DrawText_(rect.x + rect.w / 2 + 2, rect.y + rect.h + lstatic.ten * 3 / 4, now[0].OutContent, 'start', true));
            }

            if (now[0].Type == NodeType.condition) {
                let tp = now[0].sideType || 0, cs = now[0].changeSide || false;
                let tt = now[0].trueText || '是'
                let ft = now[0].falseText || '否'
                if ((cs & tp == 2) || (!cs & tp == 0))
                    Svg.push(DrawText_(rect.x + rect.w / 2, rect.y + rect.h + +lstatic.ten / 2, tt, 'start', true, 'text-before-edge'));
                else if (!cs && tp != 0)
                    Svg.push(DrawText_(rect.x + rect.w + lstatic.ten / 5, rect.y + rect.h / 2, tt, 'start', true, 'text-after-edge'));
                else
                    Svg.push(DrawText_(rect.x - lstatic.ten / 4, rect.y + rect.h / 2, tt, 'end', true, 'text-after-edge'));

                if (!now[0].hideFalse) {
                    if ((cs & tp == 0) || (!cs & tp == 2))
                        Svg.push(DrawText_(rect.x + rect.w / 2, rect.y + rect.h + +lstatic.ten / 2, ft, 'start', true, 'text-before-edge'));
                    else if (cs && tp != 0)
                        Svg.push(DrawText_(rect.x + rect.w + lstatic.ten / 5, rect.y + rect.h / 2, ft, 'start', true, 'text-after-edge'));
                    else
                        Svg.push(DrawText_(rect.x - lstatic.ten / 4, rect.y + rect.h / 2, ft, 'end', true, 'text-after-edge'));
                }

                let t = now[0];
                now[0] = now[0].NextNode;
                now.push(t.TrueNode);
                if (t.FalseNode != undefined)
                    now.push(t.FalseNode);
            } else {
                if (now[0] != undefined && now[0].end)
                    now.shift();
                else
                    now[0] = now[0].NextNode;
            }


        }

    }

    while (lines.length != 0) {
        var l = lines.pop();
        var n = 0;
        while (n < l.line.length) {
            l.line[n].p1.x += bal;
            l.line[n].p1.y += bal;
            l.line[n].p2.x += bal;
            l.line[n].p2.y += bal;
            n++;
        }
        l.endPoint.x += bal;
        l.endPoint.y += bal;
        Svg.push(DrawLines(l.line, sw));
        if (l.end.Type == NodeType.jump)
            continue;
        switch (l.finalWay) {
            case direction.left_:
                Svg.push(DrawLines([new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x + 4, l.endPoint.y - 2),
                new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x + 4, l.endPoint.y + 2)], sw));
                break;
            case direction.right_:
                Svg.push(DrawLines([new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x - 4, l.endPoint.y - 2),
                new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x - 4, l.endPoint.y + 2)], sw));
                break;
            case direction.up_:
                Svg.push(DrawLines([new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x + 2, l.endPoint.y + 4),
                new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x - 2, l.endPoint.y + 4)], sw));
                break;
            case direction.down_:
                Svg.push(DrawLines([new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x + 2, l.endPoint.y - 4),
                new Line(l.endPoint.x, l.endPoint.y, l.endPoint.x - 2, l.endPoint.y - 4)], sw));
                break;
        }
    }
    return { content: Svg, width: width, height: height };
}

function DivNode(node, id) {
    this.Node = node;
    this.id = id;
}

function DrawDiv(rect, id, style = '') {
    let div = '<div onclick="DivDown(event)" class="edit" id="id_' + id + '" style="position:absolute;' + style + 'top:' + rect.y + 'px;left:' + rect.x + 'px;width:' + rect.w + 'px;height:' + rect.h + 'px;' + '">';
    div += '</div>';
    return div;
}

function Draw2(Head, DivNodes) {
    let Div = new Array;
    let PaperSize = Head.size;
    let JumpCount = Head.JumpCount;
    let width = PaperSize.width + 50 + 2 * lstatic.ten * JumpCount;
    let height = PaperSize.height + 50 + 2 * lstatic.ten * JumpCount;

    let id = 0;
    let now = new Array;
    now.push(Head);

    while (now.length != 0) {
        if (now[0] == undefined) {
            now.shift();
            continue;
        }
        if (now[0].Type == NodeType.none)
            now[0] = now[0].NextNode;
        else {
            let pos = now[0].pos;
            let size = now[0].OwnSize;
            let rect = new Rect(pos.x, pos.y, size.width, size.height);
            if (now[0].Type == NodeType.input || now[0].Type == NodeType.condition || now[0].Type == NodeType.action) {
                Div.push(DrawDiv(rect, id));
                DivNodes.push(new DivNode(now[0], id));
                id++;
            } else if (now[0].Type == NodeType.jump) {
                if (now[0].whileback != true) {
                    Div.push(DrawDiv(new Rect(rect.x - 5, rect.y - 5, 10, 10), id, ' border:#505050 solid 1px;'));
                    DivNodes.push(new DivNode(now[0], id));
                    id++;
                }
                now.shift();
                continue;
            }

            if (now[0].Type == NodeType.condition) {
                let t = now[0];
                if (now[0].NextNode.Type != NodeType.jump)
                    now[0] = now[0].NextNode;
                else
                    now.shift();
                now.push(t.TrueNode);
                if (t.FalseNode != undefined)
                    now.push(t.FalseNode);
            } else {
                if (now[0] != undefined && now[0].end)
                    now.shift();
                else
                    now[0] = now[0].NextNode;
            }


        }

    }
    return { content: Div, width: width, height: height };
}

function RemoveSpace(str) {

    let arr = str.split('\n');
    arr.forEach((o, i, a) => {
        let p = 0, s = o.length;
        while (o[p] == ' ')
            p++;
        while (o[s] == ' ')
            s--;
        a[i] = o.substring(p, s);
    })

    return arr.join('\n');
}

function RemoveType(parm) {
    let arr = parm.split(',');
    arr.forEach((v, i) => {
        arr[i] = RemoveSpace(v).split(' ', 2)[1].replace(' ', '');
    })
    return arr.join(',');
}

function BuildCode(type, code) {
    let max = 10000;
    if (type == 'c') {
        var reg = /[ *&]+(\w+) *\(?(.*)?\)\s*\{/g;
        reg.lastIndex = 0;
        let functions = [];
        let cap;
        while (reg.lastIndex < code.length && (cap = reg.exec(code)) != null && max > 0) {
            max--;
            let pos1 = cap.index + cap[0].length + 1;
            let pos2 = pos1;
            let c = 1;
            while (pos2 < code.length && c > 0 && max > 0) {
                max--;
                if (code[pos2] == '{')
                    c++;
                else if (code[pos2] == '}')
                    c--;
                pos2++;
            }
            if (c == 0) {
                functions.push({
                    name: cap[1],
                    content: code.substring(pos1 - 1, pos2 - 1).replace(/return/g, 'out'),
                    parm: cap[2] == undefined ? '' : RemoveType(cap[2])
                })
            }
            reg.lastIndex = pos2;
        }
        let t = '';
        let main;
        functions.forEach(val => {
            if (val.name == 'main') {
                main = val;
            } else {
                if (val.parm != '')
                    t += 'function ' + val.name + '[\nin ' + val.parm + ';\n' + val.content + '\n]\n';
                else
                    t += 'function ' + val.name + '[\n' + val.content + '\n]\n';
            }
        })
        if (max == 0 || main == undefined)
            throw 1;
        if (main.parm != '')
            t = 'in ' + main.parm + ';\n' + main.content + '\n' + t;
        else
            t = main.content + '\n' + t;
        return t;
    } else if (type == 'p') {
        let reg = /[^:]\n/g;
        reg.lastIndex = 0;
        let cap
        while (reg.lastIndex < code.length && (cap = reg.exec(code)) != null && max > 0) {
            max--;
            code = code.insert(cap.index + 1, ';');
            reg.lastIndex += 2;
        }
        let end = 0;
        reg = /[\t ]*/g;
        code = code.replace(/if +(.+) *:/g, 'if($1){');
        while (end < code.length && (end = code.indexOf(':', end)) != -1 && max > 0) {
            max--;
            end = end + 2;
            reg.lastIndex = end;
            let s = reg.exec(code)[0];
            end = code.indexOf('\n', end) + 1;
            reg.lastIndex = end;
            while (reg.lastIndex < code.length && (cap = reg.exec(code))[0].length >= s.length && max > 0) {
                max--;
                if (cap.index != end)
                    break;
                end = code.indexOf('\n', end) + 1;
                if (end == 0)
                    break;
                reg.lastIndex = end;
            }
            if (end == 0) {
                code += '\n]\n';
                break;
            }
            else
                code = code.insert(end, '\n]\n');
        }
        code = code.replace(/def +(\w+)\(?(.+)\) *\:/g, 'function $1[\nin $2;\n');
        end = 0;
        while (end < code.length && (end = code.indexOf('{', end)) != -1 && max > 0) {
            max--;
            end = end + 2;
            reg.lastIndex = end;
            let s = reg.exec(code)[0];
            end = code.indexOf('\n', end) + 1;
            reg.lastIndex = end;
            while (reg.lastIndex < code.length && (cap = reg.exec(code))[0].length >= s.length && max > 0) {
                max--;
                if (cap.index != end)
                    break;
                end = code.indexOf('\n', end) + 1;
                if (end == 0)
                    break;
                reg.lastIndex = end;
            }
            if (end == 0) {
                code += '\n}\n';
                break;
            }
            else
                code = code.insert(end, '\n}\n');
        }
        code = code.replace(/return/g, 'out');
        if (max == 0)
            throw 1;
        return code;
    } else
        return code;
}