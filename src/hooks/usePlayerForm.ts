import { useState, useEffect } from 'react';
import { PlayerData, FormErrors } from '../types/player';
import { playerService } from '../services/playerService';
import { useAuth } from '../components/auth/AuthProvider';

const initialFormData: PlayerData = {
  nickname: '',
  gameId: '',
  email: '',
  age: '',
  server: '',
  level: '',
  weaponTier: '',
  armorTier: '',
  ornithopterTier: '',
  miningToolsTier: '',
  spiceToolsTier: '',
  interests: [],
  hasDeepDesertBase: false,
  baseSector: ''
};

export const usePlayerForm = () => {
  const [formData, setFormData] = useState<PlayerData>(initialFormData);
  const [gameIdLocked, setGameIdLocked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Carregar dados do jogador ao montar o componente
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!user?.email) return;

      try {
        // Buscar jogador pelo email do usuário autenticado
        const { data: existingPlayer } = await playerService.getPlayerByEmail(user.email);
        
        if (existingPlayer) {
          // Converter dados do banco para o formulário
          const playerFormData = playerService.convertDbToFormData(existingPlayer);
          setFormData({ ...playerFormData, email: user.email });
          setGameIdLocked(true);
          setIsRegistered(true);
        } else {
          // Novo jogador - preencher email automaticamente
          setFormData(prev => ({ ...prev, email: user.email }));
          setIsRegistered(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do jogador:', error);
      }
    };

    loadPlayerData();
  }, [user]);

  const handleInputChange = (field: keyof PlayerData, value: any) => {
    // Restrições no modo de edição
    if (isEditMode && (field === 'gameId' || field === 'nickname' || field === 'email')) {
      return; // Não permite editar esses campos no modo de edição
    }
    
    if (field === 'gameId' && gameIdLocked && !isEditMode) return;
    if (field === 'email') return; // Email não pode ser editado (vem da autenticação)
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    handleInputChange('interests', newInterests);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setErrors({}); // Limpar erros ao alternar modo
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nickname.trim()) newErrors.nickname = 'Nickname é obrigatório';
    if (!formData.gameId.trim()) newErrors.gameId = 'ID no jogo é obrigatório';
    if (!formData.age.trim()) newErrors.age = 'Idade é obrigatória';
    if (!formData.server) newErrors.server = 'Servidor é obrigatório';
    if (!formData.level.trim()) newErrors.level = 'Level é obrigatório';
    if (!formData.weaponTier) newErrors.weaponTier = 'Tier de arma é obrigatório';
    if (!formData.armorTier) newErrors.armorTier = 'Tier de armadura é obrigatório';
    if (!formData.ornithopterTier) newErrors.ornithopterTier = 'Tier do ornicóptero é obrigatório';
    if (!formData.miningToolsTier) newErrors.miningToolsTier = 'Tier das ferramentas de minério é obrigatório';
    if (!formData.spiceToolsTier) newErrors.spiceToolsTier = 'Tier das ferramentas de especiaria é obrigatório';
    if (formData.interests.length === 0) newErrors.interests = 'Selecione pelo menos um interesse';
    if (formData.hasDeepDesertBase && !formData.baseSector) {
      newErrors.baseSector = 'Setor da base é obrigatório quando possui base';
    }

    // Age validation
    const age = parseInt(formData.age);
    if (formData.age && (isNaN(age) || age < 13 || age > 100)) {
      newErrors.age = 'Idade deve ser entre 13 e 100 anos';
    }

    // Level validation - Ajustado para 1-200
    const level = parseInt(formData.level);
    if (formData.level && (isNaN(level) || level < 1 || level > 200)) {
      newErrors.level = 'Level deve ser entre 1 e 200';
    }

    // Nickname uniqueness check (será feito no servidor)
    if (formData.nickname.length < 3) {
      newErrors.nickname = 'Nickname deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user?.id) {
      alert('❌ Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    
    try {
      // Verificar se jogador já existe pelo email
      const { data: existingPlayer } = await playerService.getPlayerByEmail(user.email!);
      
      if (existingPlayer) {
        // Atualizar jogador existente
        const { data, error } = await playerService.updatePlayer(existingPlayer.id, formData, user.id);
        
        if (error) {
          if (error.message?.includes('nickname')) {
            setErrors({ nickname: 'Este nickname já está em uso' });
          } else {
            console.error('Erro ao atualizar jogador:', error);
            alert('❌ Erro ao atualizar cadastro: ' + error.message);
          }
          return;
        }
        
        console.log('✅ Jogador atualizado no Supabase:', data);
        alert('🏜️ Cadastro atualizado com sucesso no sistema imperial!');
        setIsEditMode(false); // Sair do modo de edição após salvar
      } else {
        // Criar novo jogador
        const { data, error } = await playerService.createPlayer(formData, user.id);
        
        if (error) {
          if (error.message?.includes('nickname')) {
            setErrors({ nickname: 'Este nickname já está em uso' });
          } else {
            console.error('Erro ao criar jogador:', error);
            alert('❌ Erro ao salvar cadastro: ' + error.message);
          }
          return;
        }
        
        console.log('✅ Jogador criado no Supabase:', data);
        alert('🏜️ Cadastro finalizado com sucesso! Guerreiro registrado no sistema imperial!');
        setIsRegistered(true); // Marcar como registrado
      }
      
      // Lock the game ID after successful save
      if (formData.gameId && !gameIdLocked) {
        setGameIdLocked(true);
      }
      
      // Também salvar no localStorage como backup
      localStorage.setItem('playerData', JSON.stringify(formData));
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('❌ Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    gameIdLocked,
    isRegistered,
    isEditMode,
    errors,
    loading,
    handleInputChange,
    handleInterestToggle,
    toggleEditMode,
    handleSubmit
  };
};