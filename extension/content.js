console.log("Content script loaded!");

window.addEventListener("load", () => {
  let len = 0;
  function modifyPosts() {
    //const posts = [...document.querySelectorAll("div[class$=x1lliihq]")].filter(a => a.classList.length == 1)
    const posts = document.querySelectorAll("div.html-div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp > div") 

    console.log("called")
    posts.forEach(async post => {
      if(post.dataset.mod) return;
      const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "comments": [
    post.querySelector("div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x1vvkbs").textContent
  ]
});


const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

await fetch("http://localhost:8000/predict_batch", requestOptions)
  .then((response) => response.json())
  .then((result) => {
      const rem = result.predictions[0].prediction > .5
      //const rem =  Math.random() > 0.7
      post.style.filter = rem ? "blur(20px)" : undefined
      post.dataset.mod = '1'

  })
  .catch((error) => console.error(error));
          });
  }

  const observer = new MutationObserver(modifyPosts);
  observer.observe(document.querySelector("div[role=banner] + div + div"), {
    childList: true,
    subtree: true
  });
/*observer.observe(document.querySelectorAll("div[role=dialog]")[1], {
    childList: true,
    subtree: true
  });*/

  modifyPosts();
});
