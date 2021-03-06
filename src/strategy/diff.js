/**
 * ------------------------------------------------------------
 * diff 对比新旧两个虚拟DOM树,根据directive中的diff方法为新虚拟DOM树
 * 添加change, afterChange更新钩子
 * ------------------------------------------------------------
 */
var emptyArr = []
// 防止被引用
var emptyObj = function () {
    return {
        children: [], props: {}
    }
}
var directives = avalon.directives
var rbinding = require('../seed/regexp').binding

function diff(copys, sources) {
    for (var i = 0; i < copys.length; i++) {
        var copy = copys[i]
        var src = sources[i] || emptyObj()
    
        switch (copy.nodeType) {
            case 3:
                if (copy.dynamic) {
                    directives.expr.diff(copy, src)
                }
                break
            case 8:
                if (copy.directive) {
                    directives[copy.directive].diff(copy, src,
                    copys[i+1],sources[i+1],sources[i+2]) 
                }
                if(src.afterChange){
                    execHooks(src, src.afterChange)
                }
                break
            case 1:
                if (!copy.skipAttrs) {
                    diffProps(copy, src)
                }
                if (!copy.skipContent && !copy.isVoidTag ) {
                    diff(copy.children, src.children || emptyArr, copy)
                }
                if(src.afterChange){
                    execHooks(src, src.afterChange)
                }
                break
            default: 
                if(Array.isArray(copy)){
                   diff(copy, src)
                }
                break
        }
    }
}

function execHooks(el, hooks) {
    if (hooks.length) {
        for (var hook, i = 0; hook = hooks[i++];) {
           hook(el.dom, el)
        }
    }
    delete el.afterChange
}

function diffProps(copys, sources) {
    if (copys.order) {
        var directiveType
        try {
            copys.order.replace(avalon.rword, function (name) {
                var match = name.match(rbinding)
                var type = match && match[1]
                directiveType = type
                if (directives[type]) {
                    directives[type].diff(copys, sources || emptyObj(), name)
                }
                return name
            })
        } catch (e) {
            avalon.log(directiveType, e, e.message, 'diffProps error')
        }
    }


}
avalon.diffProps = diffProps
module.exports = diff
