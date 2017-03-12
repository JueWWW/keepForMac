import React, { Component } from 'react'
import $http from '../../js/HttpRequest.js'
import autobind from 'autobind-decorator'
import CSSModules from 'react-css-modules'
import { Link, hashHistory } from 'react-router'
import moment from 'moment'
import Utils from '../../js/Utils.js'

import CommonArticle from './CommonArticle.js'

import styles from '../../sass/appRecord.scss'

@CSSModules(styles, {allowMultiple: true})
class AppRecord extends Component{
    constructor(props){
        super(props)

        this.state = {
            listData: Utils.storage.get('followTimeline') || []
        }
        this.loading = true;
        moment.locale('zh-cn')
    }

    componentWillMount(){
        $http.getFollowTimeline().then((res) => {
            if(res.ok) {
                console.info(res.data)
                this.setState({
                    listData: res.data.timeline
                })
                Utils.storage.set('followTimeline', res.data.timeline)
            }
        })
    }

    @autobind
    getListData(){
        if(!!this.state.listData.length)
            return this.state.listData.map((item, itemIndex) => {
                return (
                    <article key={itemIndex} data-type={item.type} styleName={`art-item ${item.state == 'hot' ? 'art-hot' : ''}`}>
                        <div styleName="art-inner">
                            <header styleName="art-header">
                                <img styleName="header-avatar" src={item.author.avatar} alt=""/>
                                <p styleName="header-username">{item.author.username} <span styleName="header-sub">{item.country} {item.city}</span></p>
                                <span styleName="header-time">{moment(new Date()).diff(moment(item.created), 'h') < 22 ? moment(item.created).fromNow() : moment(item.created).format('YYYY/ MM /DD HH:mm')}</span>
                            </header>
                            <section styleName="art-wrap"><CommonArticle data={item}></CommonArticle></section>
                            <footer styleName="art-footer">
                                <button styleName={`footer-btn ${item.hasLiked ? 'active' : ''}`} onClick={() => this.handleEventLike(item)} title={item.hasLiked ? '取消加油' : '加油'}><span styleName="footer-sp"><i className="iconfont fz14 icon-liked"></i></span></button>
                                <button styleName="footer-btn" title="评论"><span styleName="footer-sp"><i className="iconfont fz14 icon-comment"></i></span></button>
                                <button styleName="footer-btn" title="分享"><span styleName="footer-sp"><i className="iconfont fz14 icon-share"></i></span></button>
                                <div styleName="footer-inner">
                                    <span styleName="item-workout" hidden={item.type != 'normal'}><i className="iconfont fz12 icon-training"></i> 完成 {item.meta.workoutName} 第 {item.meta.count} 次</span>
                                </div>
                                <span className="fz12" styleName="art-liked"><i className="iconfont icon-cheer fz14"></i>{item.likes}人加油</span>
                            </footer>
                        </div>
                    </article>
                )
            })
        else
            // loading
            return(
                <div>
                    <article styleName="art-item">
                        <div styleName="art-inner">
                            <header styleName="art-header">
                                <i className="sp-placeholder" styleName="header-avatar"></i>
                                <p styleName="header-username"><span className="sp-placeholder"></span> <span className="sp-placeholder"></span></p>
                                <span styleName="header-time"><span className="sp-placeholder"></span></span>
                            </header>
                            <section styleName="art-wrap">
                                <div styleName="art-content">
                                    <i className="sp-placeholder" styleName="art-photo"></i>
                                    <div styleName="art-txt">
                                        <p className="sp-placeholder"></p>
                                        <p className="sp-placeholder"></p>
                                        <span className="sp-placeholder"></span>
                                    </div>
                                </div>
                            </section>
                            <footer styleName="art-footer">
                                <button className="sp-placeholder" styleName="footer-btn"><span className="sp-placeholder"></span></button>
                                <button className="sp-placeholder" styleName="footer-btn"><span className="sp-placeholder"></span></button>
                                <button className="sp-placeholder" styleName="footer-btn"><span className="sp-placeholder"></span></button>
                                <div styleName="footer-inner">
                                    <span className="sp-placeholder"></span>
                                </div>
                                <span className="sp-placeholder"></span>
                            </footer>
                        </div>
                    </article>
                </div>
            )
    }

    // 点赞评论
    @autobind
    handleEventLike(item){
        if(item) {
            $http.setArticleLike(item._id).then((res) => {
                if(res.status == 204){
                    item.hasLiked = item.hasLiked ? false : true
                    item.likes = item.hasLiked ? item.likes + 1 : item.likes - 1
                    this.setState({
                        listData: this.state.listData
                    })
                }
            })
        }
    }

    @autobind
    handleScroll(e){
        if(this.loading && e.target.scrollTop > (e.target.scrollHeight-e.target.clientHeight) * .99) {
            this.loading = false
            $http.getFollowTimeline(this.state.listData[this.state.listData.length - 1]._id).then((res) => {
                if (res.ok) {
                    let data = res.data.timeline || []
                    this.setState({
                        listData: [...this.state.listData, ...data]
                    })
                    Utils.storage.set('followTimeline', this.state.listData)
                    this.loading = true
                }
            })
        }
    }

    render(){
        return(
            <div className="scroll-content">
                <div className="scroll-content" onScroll={this.handleScroll}>
                    <section styleName="art-list">
                        {this.getListData()}
                    </section>
                </div>
                {this.props.children}
            </div>
        )
    }
}

export default AppRecord