import swal from 'sweetalert'
import {post} from './utils'

// 输入问题答案，闭包用于保存数据
let questions = function (data) {
  let albums = {}
  for (let item of data) {
    if (item.type !== 'ALBUM') {
      continue
    }
    albums[item.path] = item
  }

  return function (path, back = false) {
    swal({
      title: albums[path].question,
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: false,
      closeOnCancel: !back,
      allowOutsideClick: !back,
      showLoaderOnConfirm: true,
      animation: 'pop',
      confirmButtonText: '确认',
      cancelButtonText: back ? '返回' : '取消',
      inputPlaceholder: '请输入答案，正确即可访问'
    }, function (answer) {
      if (answer === false) {
        if (back) {
          window.history.back()
        }
        return false
      } else if (!answer) {
        swal.showInputError('答案不能为空')
        return false
      }

      post(albums[path].url, {answer})
    })
  }
}

export default questions
