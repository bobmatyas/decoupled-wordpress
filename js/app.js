console.log('app loaded');

const API_ROUTE = 'https://sandalwood.mystagingwebsite.com/wp-json/' // define main site URL

/* initial setup */

getSiteInfo();


/* get site title / description */

function getSiteInfo() { 
    fetch( API_ROUTE)
    .then(response => {
      if (response.status !== 200) {
        console.log("Problem! Status Code: " + response.status);
        return;
      }
      response.json().then(data => {
        setSiteTitle( data.name );
        setSiteDescription( data.description );
      });
    })
    .catch(function(err) {
      console.log("Error: ", err);
    });
};

function setSiteTitle( name ) {
    let siteTitle = document.getElementById('siteTitle');
    siteTitle.innerText = name;
}

function setSiteDescription( description ) {
    let siteTitle = document.getElementById('siteDescription');
    siteTitle.innerText = description;
}