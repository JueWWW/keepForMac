import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import { Link } from 'react-router'
import moment from 'moment'
import $http from '../../js/HttpRequest.js'
import Utils from '../../js/Utils.js'

import AppSlideContent from '../../components/AppSlideContent.js'
import PioneerList from '../common/PioneerList.js'
import CommonAvatar from '../common/CommonAvatar.js'

import styles from '../../sass/appRecord.scss'

@CSSModules(styles, {allowMultiple: true})
class ArticleContent extends Component{
    constructor(props){
        super(props)

        this.state = {
            data: null,
            comments: [],
            hotComments: []
        }
        this.loading = true
    }

    componentWillMount(){
        // 动态详情
        $http.getFollowDetail(this.props.params.id).then((res) => {
            if(res.ok) {
                console.info(res.data)
                this.setState({
                    data: res.data
                })
            }
        })

        // 精彩评论
        $http.getFollowHotComments(this.props.params.id).then((res) => {
            if(res.ok) {
                console.info(res.data)
                this.setState({
                    hotComments: res.data
                })
            }
        })

        // 加载评论
        this.handleScroll(null, true)

    }

    @autobind
    getPioneerContent(list = null){
        if(list && list.length>0)
            return list.map((item, index) => {
                return <li key={item._id + index}><Link styleName="pioneer-item" onClick={() => this.handleUserInfo(item._id)} ><img src={item.avatar} alt=""/></Link></li>
            })
    }

    handleText (val) {
        const reg = /(<br>)/g
        let br = React.createElement('br')
        return val.replace(/(<img.*?)>/g ,"").replace(/\n/g, '<br>').split(reg).map((item, index) => {
            return item.match(reg) ? <br key={index} /> : item
        })
    }

    handleLink (val) {
        const reg = /(#(?!\s*#)[^#]+#)/g
        return val.split(reg).map((ment, key) => {
            return !ment.match(reg) ? this.handleText(ment) : <Link key={key} to={`/hashtag/${encodeURIComponent(ment.substring(1, ment.length-1))}`}>{ment}</Link>
        })
    }

    @autobind
    getArticleDetail(item){
        switch (item.type){
            case 'article':
                return (
                    <div styleName="article-card">
                        <img src={item.photo ? `${item.photo}` : ''} alt=""/>
                        <article styleName="art-blur-inner">
                            <div styleName="inner-back" style={{backgroundImage: `url(${item.photo})`}}></div>
                            <p styleName="card-title">{this.handleText(item.title)}</p>
                            <p styleName="card-desc">{this.handleText(item.content)}</p>
                        </article>
                    </div>
                )
                break;
            case 'normal':
            case 'direct':
                return (
                    <div>
                        <img hidden={!item.photo} src={item.photo} alt=""/>
                        <p styleName="article-txt">{this.handleLink(item.content)}</p>
                    </div>
                )
                break;
            case 'share':
                return(
                    <div>
                        <img hidden={!item.photo} src={item.photo} alt=""/>
                        <p styleName="article-txt">{this.handleLink(item.content)}</p>
                        <div styleName="art-share-card">
                            <div styleName="card-img" style={{backgroundImage:`url(${item.shareCard.image})`}}></div>
                            <div styleName="card-inner">
                                <p styleName="card-title">{this.handleText(item.shareCard.title)}</p>
                                <p styleName="card-desc">{this.handleText(item.shareCard.content)}</p>
                            </div>
                        </div>
                    </div>
                )
                break;
            case 'run':
                return(
                    <div>
                        <img hidden={!item.photo} src={item.photo} alt=""/>
                        <p styleName="article-txt">{this.handleLink(item.content)}</p>
                        <div styleName="art-run-card">
                            <p styleName="art-run-title"><img width="18" src={item.meta.icon} alt=""/> {this.handleText(item.meta.title)}</p>
                            <img src={item.meta.picture} alt=""/>
                        </div>
                    </div>
                )
                break;
            default:
                return false
        }
    }

    @autobind
    getReplyContent(item){
        if(item.replyComment)
            return(
                <div key={item.replyComment.author._id} styleName="comment-reply">
                    <Link>{item.replyComment.author.username}</Link>: {item.replyComment.content}
                </div>
            )
    }

    // 点赞评论
    @autobind
    handleEventLike(){
        if(this.props.params.id) {
            $http.setArticleLike(this.props.params.id).then((res) => {
                if(res.status == 204){
                    this.state.data.hasLiked = this.state.data.hasLiked ? false : true
                    this.state.data.likes = this.state.data.hasLiked ? this.state.data.likes + 1 : this.state.data.likes - 1
                    this.setState({
                        data: this.state.data
                    })
                    this.props.onLikeEvent()
                }
            })
        }
    }

    @autobind
    handleScroll(e, Load = ''){
        if(Load == true || this.loading && e.target.scrollTop > (e.target.scrollHeight-e.target.clientHeight) * .99) {
            this.loading = false
            $http.getFollowComments(this.props.params.id, this.state.comments.length ? this.state.comments[this.state.comments.length-1]._id : '').then((res) => {
                if(res.ok) {
                    if(typeof res.data == 'object' && res.data.length) {
                        console.info(res.data)
                        this.setState({
                            comments: [...this.state.comments, ...res.data]
                        })
                        this.loading = true
                    }
                }
            })
        }
    }

    render(){
        const item = this.state.data
        if(item)
        return (
            <AppSlideContent>
                <div className="slide-content-wrap" onScroll={this.handleScroll}>
                    <div styleName="article-detail">
                        <section styleName="article-content">
                            <header styleName="art-header">
                                <span styleName="header-avatar"><CommonAvatar userid={item.author._id} avatar={item.author.avatar}></CommonAvatar></span>
                                <p styleName="header-username">{item.author.username} <span styleName="header-sub">{item.country} {item.city}</span></p>
                                <span styleName="header-time">{moment(new Date()).diff(moment(item.created), 'h') < 22 ? moment(item.created).fromNow() : moment(item.created).format('YYYY/ MM /DD HH:mm')}</span>
                            </header>
                            <section styleName="art-wrap">
                                {this.getArticleDetail(item)}
                                <p styleName="article-other"><span hidden={!(item.externalShareCount + item.internalShareCount)}>{item.externalShareCount + item.internalShareCount} 分享</span>  <span hidden={!item.favoriteCount}> {item.favoriteCount} 收藏</span></p>
                            </section>
                            <footer styleName="article-footer">
                                <button styleName={`footer-btn ${item.hasLiked ? 'active' : ''}`} onClick={() => this.handleEventLike(item)} title={item.hasLiked ? '取消加油' : '加油'}><span styleName="footer-sp"><i className="iconfont fz14 icon-liked"></i></span></button>
                                <button styleName="footer-btn" title="评论"><span styleName="footer-sp"><i className="iconfont fz14 icon-comment"></i></span></button>
                                <button styleName="footer-btn" title="分享"><span styleName="footer-sp"><i className="iconfont fz14 icon-share"></i></span></button>
                            </footer>
                        </section>
                        <section styleName="article-comments">
                            <span styleName="article-pioneer">{item.likes} 加油</span>
                            <PioneerList hidden={!item.likers.length} list={item.likers}></PioneerList>
                            <Link className="show-more"><i className={`iconfont icon-more`}></i></Link>
                        </section>
                        <section styleName="art-comments" hidden={!this.state.hotComments.length}>
                            <div styleName="comment-caption">精彩评论 {this.state.hotComments.length}</div>
                            <ul>
                                {this.state.hotComments.length && this.state.hotComments.map((item, index) => {
                                    return (
                                        <li key={index}>
                                            <div styleName="comment-header">
                                                <span styleName="comment-avatar"><CommonAvatar userid={item.author._id} avatar={item.author.avatar}></CommonAvatar></span>
                                                <div styleName="comment-inner">
                                                    <p styleName="comment-username">{item.author.username}</p>
                                                    <p styleName="comment-time">{moment(new Date()).diff(moment(item.created), 'h') < 22 ? moment(item.created).fromNow() : moment(item.created).format('YYYY/MM/DD HH:mm')}</p>
                                                </div>
                                            </div>
                                            <div styleName="comment-content">{item.content}</div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                        <section styleName="art-comments" hidden={!item.comments}>
                            <div styleName="comment-caption">全部评论 {item.comments}</div>
                            <ul>
                                {this.state.comments.length && this.state.comments.map((item, index) => {
                                    return (
                                        <li key={index}>
                                            <div styleName="comment-header">
                                                <span styleName="comment-avatar"><CommonAvatar userid={item.author._id} avatar={item.author.avatar}></CommonAvatar></span>
                                                <div styleName="comment-inner">
                                                    <p styleName="comment-username">{item.author.username}</p>
                                                    <p styleName="comment-time">{moment(new Date()).diff(moment(item.created), 'h') < 22 ? moment(item.created).fromNow() : moment(item.created).format('YYYY/MM/DD HH:mm')}</p>
                                                </div>
                                            </div>
                                            <div styleName="comment-content">
                                                {this.getReplyContent(item)}
                                                {item.content}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    </div>
                </div>
            </AppSlideContent>
        )
    }
}

export default ArticleContent