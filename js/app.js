
const API_ROUTE = 'https://sandalwood.mystagingwebsite.com/wp-json/' // define main site URL

/* initialize app */

getSiteInfo();
setupMenu();
listenForPageChange();
loadContent();

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
    const siteTitle = document.getElementById('siteTitle');
    siteTitle.innerText = name;
};

function setSiteDescription( description ) {
    const siteTitle = document.getElementById('siteDescription');
    siteTitle.innerText = description;
};

/* setup menu */

function setupMenu() {
    fetch( API_ROUTE + 'wp/v2/pages?per_page=3')
    .then(response => {
      if (response.status !== 200) {
        console.log("Problem! Status Code: " + response.status);
        return;
      }
      response.json().then(data => {
        renderMenu(data);
      });
    })
    .catch(function(err) {
      console.log("Error: ", err);
    });    
};

function renderMenu( pages ) {
    pages.map( page => addMenuItem( page.slug, page.title.rendered ));
};

function addMenuItem( slug, title ) {  
    const menuItem = document.createElement( 'li' ); 
    const menuLink = document.createElement( 'a' );
    menuLink.title = title;
    menuLink.href = `#${slug}`;
    menuLink.innerText = title;
    menuItem.appendChild(menuLink);
    const mainMenu = document.getElementById( 'mainMenu' );
    mainMenu.appendChild( menuItem );
};

/* router */

function listenForPageChange() {
  window.addEventListener( 'hashchange', loadContent, false );
};

function loadContent() {  
  const slug = getSlug();
 
  if ( null === slug ) {
    setPageHeading( 'Blog' );
    getBlogPostList( 'home' );
    clearSidebar();
    getSideBar();
  } else if ( slug.includes ( 'home/') ) {
    let shortSlug = checkSpecialTypes( 'home', slug );
    getBlogPostList( 'home', shortSlug );
    setPageHeading( 'Blog' );     
  } else if ( 'home' === slug ) {
      setPageHeading( 'Blog' );
      getBlogPostList( 'home' );
      clearSidebar();
      getSideBar();  
  } else if ( 'media' === slug ) {
      clearSidebar();
      getMedia();
  } else if ( slug.includes( 'blog/' )) {
      let shortSlug = checkSpecialTypes( 'blog', slug );
      getBlogPost( shortSlug );
      clearSidebar();
      getSideBar();
  } else if ( slug.includes( 'tags/' )) {
      const tag = checkSpecialTypes( 'tags', slug );
      getBlogPostList(null, null, tag); 
      setTaxonomyHeading( 'tags', tag );
  } else if ( slug.includes( 'categories/' )) {
      const category = checkSpecialTypes( 'categories', slug );
      getBlogPostList(null, null, null, category ); 
      setTaxonomyHeading( 'categories', category );
  } else {
      getPageContent( slug );
  }
};

/* this function handles special pages: blog posts, tags, and categories */

function checkSpecialTypes( type, slug ) {
    let newSlug;

    switch (type) {
      case 'home':
        newSlug = slug.replace('home/', '');
        break;
      case 'blog':
        newSlug = slug.replace('blog/', '');
        break;
      case 'tags': 
        newSlug = slug.replace('tags/', '');
        break;
      case 'categories':
        newSlug = slug.replace('categories/', '');
        break;
    }

    return newSlug;
};


function getSlug() {
  slug = window.location.hash;
  
  if( "" === slug ) {
    return null;
  } else {
    return slug.substr( 1 );
  }
};

/* get content by page slug */

function getPageContent( slug ) {
  fetch( API_ROUTE + 'wp/v2/pages?slug=' + slug )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      setPageHeading(data[0].title.rendered);
      setPageContent(data[0].content.rendered);
      if ( slug != '' | slug != 'home' ) {
          clearSidebar();
      }
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function setPageContent( content ) {
  const pageContentInner = document.getElementById( 'contentInner' );
  clearContent();
  pageContentInner.innerHTML = content;
};

/* get site media */

function getMedia() {
  fetch( API_ROUTE + 'wp/v2/media')
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      setPageHeading( 'Media' );
      clearContent();
      data.map( img => renderImage( img.source_url, img.alt_text ));
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function renderImage ( image, alt_text ) {
  const img = document.createElement( 'img' );
        pageContent = document.getElementById( 'contentInner' );
  img.src = image;
  img.alt = alt_text;
  img.className = 'img-responsive img-margin';

  pageContent.appendChild( img );
};

/* blog display */

function getBlogPostList( is_home, offset, tag_limit, category_limit ) {

  let route = API_ROUTE + 'wp/v2/posts'
  
  if ( null != offset) {
      route = route + '?page=' + offset;
  } else if ( null != tag_limit) {
      route = route + '?tags=' + tag_limit;
  } else if ( null != category_limit) {
      route = route + '?categories=' + category_limit;
  }

  fetch( route )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {  
      clearContent();
      clearSidebar();
      data.map( post => renderPostInList( post.title.rendered, post.slug, post.date, post.excerpt.rendered ));
      getSideBar();
      console.log(offset);
      console.log(is_home);
      if ( null != is_home ) {
        const nextPage = document.createElement( 'a' );
        nextPage.className = 'btn btn-primary'  ;
        if ( undefined === offset) {
          nextPage.href = '#home/2';
        } else {

          let increment = parseInt(offset) + 1;
          nextPage.href = `#home/${increment}`
        }

        nextPage.innerText  = 'Next';
        const container = document.getElementById( 'contentInner' );
        container.appendChild( nextPage );  
      }
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function renderPostInList( title, slug, date, excerpt) {
  const contentInner = document.getElementById( 'contentInner' );
  const postHolder = document.createElement( 'article' );
        postLink = document.createElement( 'h3' );
        postMeta = document.createElement( 'p' );
        postExcerpt = document.createElement( 'p' );
        postReadMoreHolder = document.createElement( 'p' );
        postReadMoreLink = document.createElement( 'a' );
        postSeparator = document.createElement( 'hr' );

  postLink.innerText = title;
  postMeta.className = 'text-muted small';
  postMeta.innerText = formatDate( date );
  postExcerpt.innerHTML = excerpt;
  postReadMoreLink.href = `#blog/${slug}`;
  postReadMoreLink.innerText = `Read More`;

  postHolder.appendChild( postLink );
  postHolder.appendChild( postMeta );
  postHolder.appendChild( postExcerpt );
  postReadMoreHolder.appendChild( postReadMoreLink );
  postHolder.appendChild( postReadMoreHolder );
  postHolder.appendChild( postSeparator );
        
  contentInner.appendChild( postHolder );
};

function getBlogPost( slug ) {
  
  const route = API_ROUTE + 'wp/v2/posts?slug=' + slug;
  
  fetch( route )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      setPageHeading( data[0].title.rendered );
      clearContent();
      renderSinglePostContent( data[0].date, data[0].id, data[0].content.rendered, );
      getComments( data[0].id );
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });  

};

function getSideBar() {
  getTaxonomies( 'tags' );
  getTaxonomies( 'categories' );
};


function getComments( post_id ) {
  
  const route = API_ROUTE + 'wp/v2/comments?post=' + post_id;
    
  fetch( route )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {

      if ( 0 === data.length ) {
          renderCommentList( false );
      } else {
          renderCommentList( true, data );
      }
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function renderCommentList( has_comments, data ) {
  const commentHolder = document.createElement( 'div' );
        commentSeparator = document.createElement( 'hr' );
        commentHeading = document.createElement( 'h3' );
        contentHolder = document.getElementById( 'contentInner' );

  commentHolder.appendChild( commentSeparator );

  if ( false === has_comments ) {
    commentHeading.innerText = 'No Comments'
    commentHolder.appendChild( commentHeading );
  } else {
    commentHeading.innerText = 'Comments';
    commentHolder.appendChild( commentHeading );
    data.map( comment => renderIndividualComment( commentHolder, comment.content.rendered, comment.author_name, comment.date) );
  
  }

  contentHolder.appendChild( commentHolder );

};

function renderIndividualComment( container, comment, author, date ) {
  const commentHolder = document.createElement( 'div' );
        commentContent = document.createElement( 'blockquote' );
        commentAuthorMeta = document.createElement( 'p' );
        commentAuthor = `Posted by ${author} on ${formatDate(date)}`;
        commentSeparator = document.createElement( 'hr' );
  
  commentContent.innerHTML = comment;
  commentAuthorMeta.innerHTML = commentAuthor;
  
  commentHolder.appendChild( commentContent );
  commentHolder.appendChild( commentAuthorMeta );
  commentHolder.appendChild( commentSeparator );

  container.appendChild( commentHolder );
};

function renderSinglePostContent( post_date, post_id, post_content ) {

  const contentInner = document.getElementById( 'contentInner' );
        postHolder = document.createElement( 'article' );
        postMeta = document.createElement( 'p' );
        postContent = document.createElement( 'div' );

  postMeta.className = 'text-muted small';
  postMeta.innerText = formatDate( post_date );
  postContent.innerHTML = post_content;

  postHolder.appendChild( postMeta );
  postHolder.appendChild( postContent );

  contentInner.appendChild( postHolder );

};


/* handle taxonomies */
function getTaxonomies( type ) {
  fetch( API_ROUTE + 'wp/v2/' + type )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      renderTaxonomyHolder( type );
      data.map( taxonomy => renderTaxonomyList( type, taxonomy.id, taxonomy.name ));
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function renderTaxonomyHolder( type ) {
  const taxonomyHolder = document.createElement( 'div' );
        taxonomyHeading = document.createElement( 'h4' );
        taxonomyList = document.createElement( 'ul' );
        sideBar = document.getElementById( 'sideBar' );

  taxonomyHolder.id =  `${type}Holder`;
  taxonomyList.id = `${type}List`;
  type = type[0].toUpperCase() + type.substring(1);
  taxonomyHeading.innerText = type;

  taxonomyHolder.appendChild( taxonomyHeading );
  taxonomyHolder.appendChild( taxonomyList );
  sideBar.appendChild( taxonomyHolder );
};

function renderTaxonomyList( type, id, name ) {
  const taxonomyItem = document.createElement( 'li' );
        taxonomyLink = document.createElement( 'a' );
        taxonomyList = document.getElementById( type + 'List');

  taxonomyLink.href = `#${type}/${id}`
  taxonomyLink.innerText = name;
  taxonomyItem.appendChild( taxonomyLink );
  taxonomyList.appendChild( taxonomyItem );      
};


function setTaxonomyHeading( type, id ) {
  fetch( API_ROUTE + 'wp/v2/' + type + '/' + id )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      const header = document.getElementById( 'pageHeader' );
      console.log(data);
      if ( 'tags' === type) {
          header.innerText = `Posts Tagged with: ${data.name}`;
      } else {
          header.innerText = `Posts Categorized with: ${data.name}`;
      }
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    



};

/* utilities */

function clearContent() {
  const pageContentInner = document.getElementById( 'contentInner' );
  pageContentInner.innerHTML = '';
};

function clearSidebar() {
  const sideBarContent = document.getElementById( 'sideBar' );
  sideBarContent.innerHTML = '';
};

function setPageHeading( heading ) {
  const header =  document.getElementById( 'pageHeader' );
  header.innerText = heading;
};

function formatDate( date ) {
  const dateFromApi = new Date( date );
        dateFormatted = dateFromApi.toLocaleDateString() + " " + dateFromApi.toLocaleTimeString();
  
  return dateFormatted;
};