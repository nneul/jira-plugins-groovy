import React from 'react';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';

import Button from 'aui-react/lib/AUIButton';
import Message from 'aui-react/lib/AUIMessage';

import {ListenerActionCreators} from './listeners.reducer';

import {ConditionModel, ListenerModel} from '../model/listener.model';

import {listenerService} from '../service/services';

import {ListenerMessages, ListenerTypeMessages} from '../i18n/listener.i18n';
import {FieldMessages, TitleMessages} from '../i18n/common.i18n';

import {Script} from '../common/Script';

import './ListenerRegistry.less';
import {RegistryMessages} from '../i18n/registry.i18n';


export class ListenerRegistry extends React.Component {
    static propTypes = {
        listeners: PropTypes.arrayOf(ListenerModel).isRequired,
        triggerDialog: PropTypes.func.isRequired
    };

    _triggerDialog = (isNew, id) => () => this.props.triggerDialog(isNew, id);

    render() {
        const {listeners} = this.props;

        return (
            <div className="flex-column">
                <header className="aui-page-header">
                    <div className="aui-page-header-inner">
                        <div className="aui-page-header-main">
                            <h2>{TitleMessages.listeners}</h2>
                        </div>
                        <div className="aui-page-header-actions">
                            <Button onClick={this._triggerDialog(true)}>
                                {ListenerMessages.addListener}
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="page-content ScriptList">
                    {listeners.map(listener =>
                        <Listener
                            key={listener.id}
                            listener={listener}
                            onEdit={this._triggerDialog(false, listener.id)}
                        />
                    )}
                    {!listeners.length && <Message type="info" title={ListenerMessages.noListeners}>{ListenerMessages.noListeners}</Message>}
                </div>
            </div>
        );
    }
}

@connect(
    () => { return {}; },
    ListenerActionCreators
)
class Listener extends React.Component {
    static propTypes = {
        listener: ListenerModel.isRequired,
        onEdit: PropTypes.func.isRequired,
        deleteListener: PropTypes.func.isRequired
    };

    _delete = () => {
        const listener = this.props.listener;

        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Are you sure you want to delete "${listener.name}"?`)) {
            listenerService.deleteListener(listener.id).then(() => this.props.deleteListener(listener.id));
        }
    };

    render() {
        const {listener, onEdit} = this.props;

        return (
            <Script
                script={{
                    id: listener.uuid,
                    name: listener.name,
                    inline: true,
                    scriptBody: listener.scriptBody,
                    changelogs: listener.changelogs
                }}

                withChangelog={true}
                onEdit={onEdit}
                onDelete={this._delete}
            >
                <Condition condition={listener.condition}/>
            </Script>
        );
    }
}


@connect(
    state => {
        return {
            projects: state.projects,
            eventTypes: state.eventTypes
        };
    }
)
class Condition extends React.Component {
    static propTypes = {
        condition: ConditionModel.isRequired,
        projects: PropTypes.object.isRequired,
        eventTypes: PropTypes.object.isRequired
    };

    render() {
        const {condition, projects, eventTypes} = this.props;

        let vertical = true;
        let conditionBody = null;
        switch (condition.type) {
            case 'CLASS_NAME':
                conditionBody = condition.className;
                break;
            case 'ISSUE':
                conditionBody = (
                    <div className="flex-row">
                        <div className="flex-grow">
                            <strong>{FieldMessages.projects}{':'}</strong>
                            {condition.projectIds.map(id =>
                                <div key={id}>{projects[id] || id}</div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <strong>{FieldMessages.eventTypes}{':'}</strong>
                            {condition.typeIds.map(id =>
                                <div key={id}>{eventTypes[id] || id}</div>
                            )}
                        </div>
                    </div>
                );
                break;
            default:
                conditionBody = 'not implemented'; //todo: ???
        }

        return (
            <div className={`${vertical ? 'flex-column' : 'flex-row'}`}>
                <div className="ConditionName">
                    <strong>{ListenerTypeMessages[condition.type]}</strong>
                </div>
                <div className="ConditionBody">
                    {conditionBody}
                </div>
            </div>
        );
    }
}