
const prom1 = new Promise((resolve,reject) => {
  setTimeout(() => {
    console.log(" i am prom 1")
    resolve();
  },5000);
  console.log(" i am prom 2")
});



function fun1(){
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      console.log(" i am prom 1")
      resolve();
    },5000);
    console.log(" i am prom 2")
  });
}




// function prom1() {
//    return Promise.resolve("hello")
// }
//
// prom1()
// console.log('i am prom 2');

// async function main()
// {
//
//   await prom1
//   const prom2 = new Promise((resolve) => {
//     setTimeout(() => {
//       console.log(" i am prom 2")
//       resolve();
//     },7000)
//     console.log("Hello")
//   })
//   await prom2
// }
// main()

// async function fun2() {
//   console.log("start");
//   await prom2
//   await prom1
//   console.log("done");
// }
//
// fun2()
// console.log("complete")

// setTimeout(()=>{
//   cons
// },30000)

// async function fun3() {
//   console.log("fun3")
// }
//
//
// async function fun1() {
//   await fun3();
//   console.log("i am async");
// }

// async function fun1() {
//   console.log('fun1')
// }
//
// async function fun2() {
//   console.log('start');
//    await fun1();
//   console.log('end');
// }
//
// fun2();
// console.log('complete');
