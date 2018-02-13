+function($) {
    $(function() {

        const newsScraper = {
            init () {
                this.domCaching();
                this.eventBinding();
            },
            domCaching () {
                this.divMyAlert = $('#myAlerts');
                this.articleOptions = $('.article-options');
                this.commentModal = $('#commentModal');
                this.commentForm = $('#commentForm');
                this.modalFooter = $('.modal-footer');
            },
            eventBinding () {
                this.articleOptions.on('click', '.fa-bookmark', this.saveArticle.bind(this));
                this.articleOptions.on('click', '.fa-trash-alt', this.removeArticle.bind(this));
                this.commentModal.on('show.bs.modal', this.commentModalFn.bind(this));
                this.modalFooter.on('click', '.removeComment', this.removeComment.bind(this));
            },
            removeArticle (e) {
                let clickedItem = $(e.target);
                let parentEl = $(e.target.closest('.card[data-dbid]'));
                let articleID = parentEl.attr('data-dbid');
                
                $.ajax({
                    type: 'DELETE',
                    url: `/delete/article/${articleID}`,
                    success: response => {
                        this.createAlert("success", "Article removed!");
                        this.removeAlert();
                        location.reload();
                    },
                    error: () => {
                        this.createAlert("danger", "There was an error with your request, please try again");
                        this.removeAlert();
                    }
                });
            },
            saveArticle (e) {
                let clickedItem = $(e.target);
                let parentEl = $(e.target.closest('.card[data-dbid]'));
                let articleID = parentEl.attr('data-dbid');
                
                $.ajax({
                    type: 'PUT',
                    url: `/save/${articleID}`,
                    success: response => {
                        this.createAlert("success", "Article saved!");
                        this.removeAlert();
                    },
                    error: () => {
                        this.createAlert("danger", "There was an error with your request, please try again");
                        this.removeAlert();
                    }
                });
            },
            createAlert (type, message) {
                let alertHTML = 
                    $(`
                        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                            ${message}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    `);
            this.divMyAlert.append(alertHTML);
            },
            removeAlert () {
                setTimeout( () => { this.divMyAlert.empty() }, 3000);
            },
            commentModalFn (e) {
                const button = $(e.relatedTarget); // Btn that triggered the modal
                const docID = button.data('dbid') // Extract info from data-* attributes
 
                this.commentForm.attr("action", `/save/comments/${docID}`);  // Update the modal's content
                this.getComments(docID);
            },
            getComments (id) {
                // Remove any previous comments
                this.modalFooter.empty();
                // Get comments from the clicked article
                $.ajax({
                    type: 'GET',
                    url: `/save/comments/${id}`,
                    success: response => {
                        // Add comment to the page
                        response.comments.forEach(element => {
                            let comment = 
                                $(`
                                    <ul class="list-group">
                                        <li data-commentID="${element._id}" class="list-group-item d-flex justify-content-between align-items-center">
                                            ${element.articleComment}
                                            <button type="button" class="btn btn-danger removeComment">X</button>
                                        </li>
                                    </ul>
                                `);
                            this.modalFooter.append(comment);
                        })
                    },
                    error: () => {
                        this.createAlert("danger", "There was an error with your request, please try again");
                        this.removeAlert();
                    }
                });
            },
            removeComment (e) {

                let clickedItem = $(e.target);
                let parentEl = $(e.target.closest('li[data-commentid]'));
                let commentID = parentEl.attr('data-commentid');
                $.ajax({
                    type: 'DELETE',
                    url: `/delete/comment/${commentID}`,
                    success: response => {
                        console.log(response);
                        this.createAlert("success", "Comment removed!");
                        this.removeAlert();
                        location.reload();
                    },
                    error: () => {
                        this.createAlert("danger", "There was an error with your request, please try again");
                        this.removeAlert();
                    }
                });
            }

        }

        newsScraper.init();
    });
}(jQuery)