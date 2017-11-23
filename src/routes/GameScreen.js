import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-primitives';
import { ActivityIndicator, Button, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';

import { game, move, cancel } from '../services/GameService';
import Grid from '../components/Grid';

export default class GameScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        const gameId = navigation.state.params.game.id;
        let title = `Single Game`;
        if (gameId) {
            title += ` #${gameId}`;
        }
        return { title };
    };

    static propTypes = {
        navigation: PropTypes.object.isRequired,
    };

    state = {
        isLoading: true,
        id: -1,
        token: '',
        currentGrid: null,
        turn: -1,
        winnerId: '',
    };

    requestGame = async (id, token) => {
        try {
            const { currentPlayer, winner } = await game()(id, token);
            this.setState({
                isLoading: false,
                id,
                token,
                currentGrid: currentPlayer.currentGrid,
                turn: currentPlayer.turn,
                winnerId: winner !== null ? winner.id : -1,
            });
        } catch (error) {
            ToastAndroid.showWithGravity(
                'A server error occured, please retry later.',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
            );
            const { navigation } = this.props;
            navigation.goBack();
        }
    };

    requestMove = async tile => {
        try {
            const { id, token } = this.state;
            const { currentPlayer, winner } = await move()(id, token, tile);
            this.setState({
                currentGrid: currentPlayer.currentGrid,
                turn: currentPlayer.turn,
                winnerId: winner ? winner.id : '',
            });
        } catch (error) {
            ToastAndroid.showWithGravity(
                'A server error occured, please retry later.',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
            );
        }
    };

    requestCancel = async () => {
        try {
            const { id, token } = this.state;
            this.setState({
                isLoading: true,
            });
            await cancel()(id, token);
            const { navigation } = this.props;
            navigation.goBack();
            ToastAndroid.showWithGravity(
                'The game has been canceled with success',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
            );
        } catch (error) {
            ToastAndroid.showWithGravity(
                'A server error occured, please retry later.',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
            );
        }
    };

    componentWillMount() {
        let id = this.props.navigation.state.params.game.id;
        let token = this.props.navigation.state.params.game.token;
        this.requestGame(id, token);
    }

    renderWinnerMessage(isWinner, isVictory, turn) {
        if (!isWinner) {
            return `Turn ${turn}`;
        } else if (isVictory) {
            return `Congratulations, you have solved the puzzle in ${
                turn
            } turns!`;
        }
        return `Sorry, you opponent solved the puzzle in ${turn} turns!`;
    }

    render() {
        const { id, currentGrid, turn, winnerId, isLoading } = this.state;

        const isWinner = winnerId !== -1;
        const isVictory = isWinner && winnerId === id;

        if (isLoading) {
            return (
                <View style={styles.page}>
                    <View style={styles.container}>
                        <ActivityIndicator
                            animating={isLoading}
                            style={styles.loader}
                            size="large"
                        />
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.page}>
                <View style={styles.container}>
                    <View style={styles.bloc}>
                        <Text style={styles.title}>
                            {this.renderWinnerMessage(
                                isWinner,
                                isVictory,
                                turn,
                            )}
                        </Text>
                        <Grid
                            onPress={this.requestMove}
                            grid={currentGrid}
                            readOnly={isWinner}
                        />
                    </View>
                    {!isWinner && (
                        <View style={styles.actions}>
                            <Button
                                style={styles.cancel}
                                color={'red'}
                                onPress={this.requestCancel}
                                title="Cancel the game"
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    actions: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        margin: 10,
    },
    bloc: {
        backgroundColor: '#E3F2FD',
        borderRadius: 2,
        elevation: 3,
        margin: 10,
        width: '100%',
    },
    container: {
        alignItems: 'center',
        width: '90%',
        justifyContent: 'flex-start',
    },
    loader: {
        alignItems: 'center',
        height: 80,
        justifyContent: 'center',
        padding: 8,
    },
    page: {
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-start',
        width: '100%',
    },
    title: {
        alignSelf: 'flex-start',
        fontSize: 20,
        margin: 10,
    },
});
