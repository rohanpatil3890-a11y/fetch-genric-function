
const cl = console.log;

const formId = document.getElementById("formId");
const TitleControl = document.getElementById("Title");
const ContentControl = document.getElementById("Content");
const userId = document.getElementById("userId");
const blogContainer = document.getElementById("blogContainer");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const loder = document.getElementById("loder");

function ObjtoArr(obj) {

    let arr = [];

    for (const key in obj) {
        obj[key].id = key;
        arr.unshift(obj[key])
    }
    return arr

}

function loader(flag) {
    if (flag) {
        loder.classList.remove("d-none");
    } else {
        loder.classList.add("d-none");
    }
}

function snackbar(title, icon) {
    Swal.fire({
        title,
        icon,
        timer: 2000
    })
}


let BASE_URL = "https://xhr-crud-929ee-default-rtdb.firebaseio.com";
let BLOG_URL = `${BASE_URL}/blogs.json`;




const makeAPiCall = (URL, method, body) => {

    loader(true);

    body = body ? JSON.stringify(body) : null;

    let obj = {
        method: method,
        body: body,
        headers: {
            "auth": "Token for Ls",
            "content-type": "application/json"
        }
    }

    return fetch(URL, obj)

        .then(res => res.json())
        .catch(err => {
            cl(err)
        })
        .finally(() =>{
            loader(false)
        })
}


function fetchAllData() {


    makeAPiCall(BLOG_URL, "GET", null)

        .then(data => {
            let blogArr = ObjtoArr(data);
            CraetCard(blogArr);

        })
}

fetchAllData();



const CraetCard = (arr) => {
    let result = arr.map(blog => {
        return `
               <div class="card mb-4" id="${blog.id}">
                        <div class="card-header">
                            <h3>${blog.title}</h3>
                        </div>
                        <div class="card-body">
                            <p>
                                ${blog.content}
                            </p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                        </div>
                    </div>
        `
    }).join("");
    blogContainer.innerHTML = result;
}



const onsubmitEvent = (eve) => {
    eve.preventDefault();

    let OBJ = {
        title: TitleControl.value,
        content: ContentControl.value,
        userId: userId.value
    }

    makeAPiCall(BLOG_URL, "POST", OBJ)

        .then(data => {
            creatNewCard(OBJ, data.name);
            formId.reset();
        })


}

const creatNewCard = (obj, id) => {
    let card = document.createElement("div");
    card.id = id;
    card.className = "card mb-4";
    card.innerHTML = `
                     <div class="card-header">
                            <h3>${obj.title}</h3>
                        </div>
                        <div class="card-body">
                            <p>
                                ${obj.content}
                            </p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                        </div>
    `;
    blogContainer.prepend(card);
    snackbar("New Blog created Successfully!!!", "success");
}


const onRemove = (ele) => {


    Swal.fire({
        title: "Do you want to remove the Movie?",
        showCancelButton: true,
        confirmButtonText: "Remove",
        denyButtonText: `Remove`,
        confirmButtonColor: "#e03131"
    }).then((result) => {
        if (result.isConfirmed) {

            let REMOVE_ID = ele.closest(".card").id;
            cl(REMOVE_ID)

            let REMOVE_URL = `${BASE_URL}/blogs/${REMOVE_ID}.json`;

            makeAPiCall(REMOVE_URL, "DELETE", null)

                .then(data => {
                    ele.closest(".card").remove();
                    snackbar(`The id with id ${REMOVE_ID} remove successfully`)
                })


        }

        loader(false)

    });


}


const onEdit = (ele) => {
    let EDIT_ID = ele.closest(".card").id;

    localStorage.setItem("EDIT_ID", EDIT_ID);

    let EDIT_URL = `${BASE_URL}/blogs/${EDIT_ID}.json`;

    makeAPiCall(EDIT_URL, "GET", null)
        .then(data => {
            TitleControl.value = data.title;
            ContentControl.value = data.content;
            userId.value = data.userId;

            submitBtn.classList.add("d-none");
            updateBtn.classList.remove("d-none");
        })
}


const onupdateEvent = () => {
    let UPDATE_ID = localStorage.getItem("EDIT_ID");

    let UPDATE_URL = `${BASE_URL}/blogs/${UPDATE_ID}.json`;

    let UPDATE_OBJ = {
        title: TitleControl.value,
        content: ContentControl.value,
        userId: userId.value,
        id: UPDATE_ID
    }

    makeAPiCall(UPDATE_URL, "PATCH", UPDATE_OBJ)
        .then(data => {

            let card = document.getElementById(UPDATE_ID);

            card.querySelector("h3").innerText = UPDATE_OBJ.title;
            card.querySelector("p").innerText = UPDATE_OBJ.content;

            submitBtn.classList.remove("d-none");
            updateBtn.classList.add("d-none");
            formId.reset();
            snackbar("Blog is Updated Successfully!!!", "success");

        })
}

updateBtn.addEventListener("click", onupdateEvent);
formId.addEventListener("submit", onsubmitEvent);