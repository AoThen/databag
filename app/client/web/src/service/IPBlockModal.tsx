import React from 'react';
import { 
  Modal, 
  TextInput, 
  NumberInput, 
  Button, 
  Table, 
  Group, 
  Text, 
  Stack, 
  ActionIcon,
  Tooltip,
  Alert,
} from '@mantine/core';
import { TbShield, TbTrash, TbAlertCircle } from 'react-icons/tb';
import classes from './IPBlockModal.module.css';
import { IPBlock } from '../api/getIPBlocks';
import { IPWhitelist } from '../api/getIPWhitelist';

interface IPBlockModalProps {
  opened: boolean;
  onClose: () => void;
  strings: Record<string, string>;
  state: {
    blocks: IPBlock[];
    whitelist: IPWhitelist[];
    blockIP: string;
    blockReason: string;
    blockDuration: number;
    whitelistIP: string;
    whitelistNote: string;
    error: string | null;
    loading: boolean;
  };
  actions: {
    setBlockIP: (ip: string) => void;
    setBlockReason: (reason: string) => void;
    setBlockDuration: (duration: number) => void;
    setWhitelistIP: (ip: string) => void;
    setWhitelistNote: (note: string) => void;
    addBlock: () => Promise<void>;
    removeBlock: (ip: string) => Promise<void>;
    addWhitelist: () => Promise<void>;
    removeWhitelist: (ip: string) => Promise<void>;
  };
}

export function IPBlockModal({ opened, onClose, strings, state, actions }: IPBlockModalProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const blockColumns = [
    { title: strings.ip, dataIndex: 'ip', key: 'ip' },
    { title: strings.reason, dataIndex: 'reason', key: 'reason' },
    { title: strings.blocked, dataIndex: 'blockedAt', key: 'blockedAt', 
      render: (_: unknown, record: IPBlock) => formatDate(record.blockedAt) },
    { title: strings.expires, dataIndex: 'expiresAt', key: 'expiresAt', 
      render: (_: unknown, record: IPBlock) => formatDate(record.expiresAt) },
    { title: strings.action, key: 'action', 
      render: (_: unknown, record: IPBlock) => (
        <Tooltip label={strings.unblock}>
          <ActionIcon variant="subtle" color="red" onClick={() => actions.removeBlock(record.ip)}>
            <TbTrash size={16} />
          </ActionIcon>
        </Tooltip>
      )},
  ];

  const whitelistColumns = [
    { title: strings.ip, dataIndex: 'ip', key: 'ip' },
    { title: strings.note, dataIndex: 'note', key: 'note' },
    { title: strings.added, dataIndex: 'createdAt', key: 'createdAt', 
      render: (_: unknown, record: IPWhitelist) => formatDate(record.createdAt) },
    { title: strings.action, key: 'action', 
      render: (_: unknown, record: IPWhitelist) => (
        <Tooltip label={strings.remove}>
          <ActionIcon variant="subtle" color="red" onClick={() => actions.removeWhitelist(record.ip)}>
            <TbTrash size={16} />
          </ActionIcon>
        </Tooltip>
      )},
  ];

  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      title={
        <Group gap="xs" className={classes.header}>
          <TbShield size={20} />
          <Text fw={500}>{strings.ipBlockManagement}</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {state.error && (
          <Alert icon={<TbAlertCircle size={16} />} color="red">
            {state.error}
          </Alert>
        )}

        <div className={classes.section}>
          <Text fw={500} mb="xs">{strings.blockIP}</Text>
          <Group gap="xs" align="flex-end" grow>
            <TextInput
              placeholder={strings.ipAddress}
              value={state.blockIP}
              onChange={(event) => actions.setBlockIP(event.currentTarget.value)}
            />
            <TextInput
              placeholder={`${strings.reason} (${strings.add})`}
              value={state.blockReason}
              onChange={(event) => actions.setBlockReason(event.currentTarget.value)}
            />
            <NumberInput
              style={{ width: 100 }}
              placeholder={strings.hours}
              min={1}
              max={720}
              value={state.blockDuration}
              onChange={(val) => actions.setBlockDuration(Number(val) || 24)}
            />
            <Button 
              onClick={actions.addBlock} 
              disabled={!state.blockIP || state.loading}
              loading={state.loading}
            >
              {strings.block}
            </Button>
          </Group>
        </div>

        <div className={classes.section}>
          <Text fw={500} mb="xs">{strings.whitelist}</Text>
          <Group gap="xs" align="flex-end" grow>
            <TextInput
              placeholder={strings.ipAddress}
              value={state.whitelistIP}
              onChange={(event) => actions.setWhitelistIP(event.currentTarget.value)}
            />
            <TextInput
              placeholder={`${strings.note} (${strings.add})`}
              value={state.whitelistNote}
              onChange={(event) => actions.setWhitelistNote(event.currentTarget.value)}
            />
            <Button 
              onClick={actions.addWhitelist} 
              disabled={!state.whitelistIP || state.loading}
              loading={state.loading}
            >
              {strings.add}
            </Button>
          </Group>
        </div>

        <div className={classes.tableSection}>
          <Text fw={500} mb="xs" className={classes.tableTitle}>{strings.blockedIPs}</Text>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{strings.ip}</Table.Th>
                <Table.Th>{strings.reason}</Table.Th>
                <Table.Th>{strings.blocked}</Table.Th>
                <Table.Th>{strings.expires}</Table.Th>
                <Table.Th>{strings.action}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {state.blocks.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" ta="center">{strings.blockedIPs}</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                state.blocks.map((block) => (
                  <Table.Tr key={block.ip}>
                    <Table.Td>{block.ip}</Table.Td>
                    <Table.Td>{block.reason}</Table.Td>
                    <Table.Td>{formatDate(block.blockedAt)}</Table.Td>
                    <Table.Td>{formatDate(block.expiresAt)}</Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="subtle" 
                        color="red" 
                        onClick={() => actions.removeBlock(block.ip)}
                      >
                        <TbTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </div>

        <div className={classes.tableSection}>
          <Text fw={500} mb="xs" className={classes.tableTitle}>{strings.whitelistedIPs}</Text>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{strings.ip}</Table.Th>
                <Table.Th>{strings.note}</Table.Th>
                <Table.Th>{strings.added}</Table.Th>
                <Table.Th>{strings.action}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {state.whitelist.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center">{strings.whitelistedIPs}</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                state.whitelist.map((item) => (
                  <Table.Tr key={item.ip}>
                    <Table.Td>{item.ip}</Table.Td>
                    <Table.Td>{item.note}</Table.Td>
                    <Table.Td>{formatDate(item.createdAt)}</Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="subtle" 
                        color="red" 
                        onClick={() => actions.removeWhitelist(item.ip)}
                      >
                        <TbTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </div>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {strings.close}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
