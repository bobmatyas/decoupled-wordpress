console.log('app loaded');

const API_ROUTE = 'https://sandalwood.mystagingwebsite.com/wp-json/' // define main site URL

/* initialize app */

getSiteInfo();
setupMenu();
getBlogPostList();
listenForPageChange();

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

  if ( null === slug || 'home' === slug ) {
      getBlogPostList();
  } else if ( 'media' === slug ) {
      getMedia();
  } else if ( slug.indexOf( '/blog/' ) ) {
      let shortSlug = checkSpecialTypes( 'blog', slug );
      getBlogPost( shortSlug );
  } else {
      getPageContent( slug );
  }
};

/* this function handles special pages: blog posts, tags, and categories */

function checkSpecialTypes( type, slug ) {
    let newSlug;

    switch (type) {
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
      console.log(data[0].title.rendered);
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
  img.classList = 'img-responsive img-margin';

  pageContent.appendChild( img );
};

/* blog display */

function getBlogPostList( offset ) {

  let route = API_ROUTE + 'wp/v2/posts'
  
  if ( offset != null ) {
    route = route + '?offset=' + offset;
  }

  fetch( route )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      setPageHeading( 'Blog' );
      clearContent();
      clearSidebar();
      getTaxonomies( 'tags' );
      getTaxonomies( 'categories' );
      data.map( post => renderPostInList( post.title.rendered, post.slug, post.date, post.excerpt.rendered ));
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
  postMeta.classList = 'text-muted small';
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
      console.log( data[0].id );
      getComments( data[0].id );
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });  

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
      console.log( data );

      if ( 0 === data.length ) {
          console.log( 'no comments' );
          renderCommentList( false );
      } else {
          console.log( 'we have comments!' );
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

  postMeta.classList = 'text-muted small';
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