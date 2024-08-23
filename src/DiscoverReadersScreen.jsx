import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  Modal,
  View,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {
  useStripeTerminal,
  Location,
  Reader,
} from '@stripe/stripe-terminal-react-native';
import { colors } from '../colors';
import ListItem from './ListItem';
import List from './List';

export default function DiscoverReadersScreen() {
  const [discoveringLoading, setDiscoveringLoading] = useState(true);
  const [connectingReader, setConnectingReader] = useState();

  const {
    cancelDiscovering,
    discoverReaders,
    discoveredReaders,
    connectInternetReader,
    simulateReaderUpdate,
    connectLocalMobileReader,
  } = useStripeTerminal({
    onFinishDiscoveringReaders: (finishError) => {
      if (finishError) {
        console.error(
          'Discover readers error',
          `${finishError.code}, ${finishError.message}`
        );
      } else {
        console.log('onFinishDiscoveringReaders success');
      }
      setDiscoveringLoading(false);
    },
    onDidReportAvailableUpdate: (update) => {
      Alert.alert('New update is available', update.deviceSoftwareVersion);
    },
    onDidReportUnexpectedReaderDisconnect: (readers) => {
      console.log('Unexpected Reader Disconnect')
      // Consider displaying a UI to notify the user and start rediscovering readers
    }
  });

  const isBTReader = (reader) =>
    ['stripeM2', 'chipper2X', 'chipper1X', 'wisePad3'].includes(
      reader.deviceType
    );

  const getReaderDisplayName = (reader) => {
    if (reader?.simulated) {
      return `SimulatorID - ${reader.deviceType}`;
    }

    return `${reader?.label || reader?.serialNumber} - ${reader.deviceType}`;
  };

  const handleDiscoverReaders = useCallback(async () => {
    setDiscoveringLoading(true);
    // List of discovered readers will be available within useStripeTerminal hook
    const { error: discoverReadersError } = await discoverReaders({
      discoveryMethod: 'localMobile',
      simulated: true,
    });

    if (discoverReadersError) {
      const { code, message } = discoverReadersError;
      Alert.alert('Discover readers error: ', `${code}, ${message}`);
    }
  }, [discoverReaders]);

  useEffect(() => {
    simulateReaderUpdate('none');
    handleDiscoverReaders();
  }, [handleDiscoverReaders, simulateReaderUpdate]);

  const handleConnectReader = async (reader) => {
    let error;

    const result = await handleConnectLocalMobileReader(reader);
    error = result.error;

    if (error) {
      setConnectingReader(undefined);
      Alert.alert(error.code, error.message);
    }
  };

  const handleConnectLocalMobileReader = async (reader) => {
    setConnectingReader(reader);
    console.log('reader', reader)

    const { reader: connectedReader, error } = await connectLocalMobileReader({
      reader,
      locationId: 'tml_simulated',
      autoReconnectOnUnexpectedDisconnect: true
    });
    console.log('connectedReader',connectedReader)
    if (error) {
      console.log('connectLocalMobileReader error:', error);
    } else {
      console.log('Reader connected successfully', connectedReader);
    }
    return { error };
  };

  return (
    <ScrollView
      testID="discovery-readers-screen"
      contentContainerStyle={styles.container}
    >
      <List
        title="NEARBY READERS"
        loading={discoveringLoading}
        description={connectingReader ? 'Connecting...' : undefined}
      >
        {discoveredReaders.map((reader) => (
          <ListItem
            key={reader.serialNumber}
            onPress={() => handleConnectReader(reader)}
            title={getReaderDisplayName(reader)}
            disabled={!isBTReader(reader) && reader.status === 'offline'}
          />
        ))}
      </List>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light_gray,
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.white,
    left: 0,
    width: '100%',
    ...Platform.select({
      ios: {
        height: 200,
      },
    }),
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  discoveredWrapper: {
    height: 50,
  },
  buttonWrapper: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    width: '100%',
  },
  locationListTitle: {
    fontWeight: '700',
  },
  picker: {
    width: '100%',
    ...Platform.select({
      android: {
        color: colors.slate,
        fontSize: 13,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
      },
    }),
  },
  pickerItem: {
    fontSize: 16,
  },
  text: {
    paddingHorizontal: 12,
    color: colors.white,
  },
  info: {
    fontWeight: '700',
    marginVertical: 10,
  },
  serialNumber: {
    maxWidth: '70%',
  },
  cancelButton: {
    color: colors.white,
    marginLeft: 22,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  infoText: {
    paddingHorizontal: 16,
    color: colors.dark_gray,
    marginVertical: 16,
  },
});
