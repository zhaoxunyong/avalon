var Cache = require('../seed/cache')
var textCache = new Cache(256)
var rexpr = avalon.config.rexpr

avalon.directive('text', {
    parse: function (binding, num) {
        return 'vnode' + num + '.textVm = __vmodel__\n' +
                'vnode' + num + '.props.wid = 2;\n' +
                'vnode' + num + '.props["av-text"] =' + avalon.parseExpr(binding) + ';\n'
    },
    diff: function (cur, pre) {
        var curValue = cur.props['av-text']
        var preValue = pre.props['av-text']
        if (curValue !== preValue) {
            var nodes = textCache.get(curValue)
            if (!Array.isArray(nodes)) {
                var hasExpr = rexpr.test(curValue)
                if (hasExpr) {
                    var child = [{type: '#text', nodeValue: curValue}]
                    var render = avalon.render(child)
                    nodes = render(cur.textVm)
                    cur.props['av-text'] = nodes[0].nodeValue
                    textCache.put(curValue, nodes)
                } else {
                    nodes = [{type: '#text', nodeValue: curValue}]
                }
            }
            cur.children = nodes
            if (cur.props['av-text'] !== preValue) {
                var list = cur.change || (cur.change = [])
                avalon.Array.ensure(list, this.update)
            }
        }
    },
    update: function (node, vnode) {
        var nodeValue = vnode.props['av-text']
        if ('textContent' in node) {
            node.textContent = nodeValue + ''
        } else {
            node.innerText = nodeValue + ''
        }
    }
})