import React, {useEffect, useState } from 'react';
import api from '../../services/api';
import { FaArrowLeft } from 'react-icons/fa';
import { Container, Owner, Loading, BackButton, IssuesList, PagesActions, FilterList } from './styles';

export default function Repositorio({match}) {
    //Só um repositório então usa {} e [] para vários
    const [repositorio, setRepositorio] = useState({});
    const [issues , setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Paginação
    const [page, setPage ] = useState(1);

    useEffect( () => {
    
        async function load() {
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            // Faz duas requisições ao mesmo tempo - cada possição do array é uma chamada da API
            const [repositorioData, issuesData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`, {
                    params: {
                        // Restrições do axios
                        state: 'open',
                        per_page: 5
                    }
                })
            ]);

            setRepositorio(repositorioData.data);
            setIssues(issuesData.data);
            setLoading(false);
        }

        load();
        
    },[match.params.repositorio]);


    // Função anônima para atualizar as issues
    useEffect( () => {
        async function loadIssue(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params: {
                    state: 'open',
                    // state acima
                    page,
                    per_page: 5,
                },
            });
            setIssues(response.data);
        }
        loadIssue();
    }, [match.params.repositorio, page]);

    // Função de paginação
    function handlePage(action){
        setPage(action === 'back' ? page - 1 : page + 1 );
    }

    if (loading) {
        // Renderização condicional
        return(
            <Loading>
                <h1>Carregando...</h1>
            </Loading>
        );
    }
    return(
        <Container>
            <BackButton to="/">
                <FaArrowLeft color="#000" size={30} />
            </BackButton>
            <Owner>
                <img src={repositorio.owner.avatar_url} 
                alt={repositorio.owner.login} 
                />

                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <FilterList>
                
            </FilterList>
            
            <IssuesList>

                {issues.map(issue => (
                    // Key necessário ser uma string
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login} />
                        <div>
                            <strong>

                                <a href={issue.html_url}>{issue.title}</a>
                                 
                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>  {label.name}  </span>
                                ))}

                            </strong>

                            <p> {issue.user.login} </p>
                        </div>
                    </li>
                ))}
              
            </IssuesList>

            <PagesActions>
                <button type="button" 
                onClick={ () => handlePage('back') }
                disabled = {page < 2}
                > Voltar
                </button>

                <button type="button" onClick={ () => handlePage('next') }> Próximo
                </button>
            </PagesActions>

        </Container>
    )
}