import demo from '../../mock/demo';

let mockdata: any = {
  ...demo
};


/**
 * 这里是umi里mock数据格式的一个转化方法，也可以自己直接写
 * 最终需要的格式:
 * [{
    url,
    method: get|post,
    response: data,
  }]
 */
let arr = [];
Object.keys(mockdata).forEach(key => {
  let url, type, data;
  url = key.split(' ')[1];
  type = key.split(' ')[0];
  mockdata[key]('', {
    send: (res: any) => {
      data = res;
    },
  });
  let obj = {
    url,
    method: type.toLocaleLowerCase(),
    response: data,
  };
  arr.push(obj);
});
export default arr;
